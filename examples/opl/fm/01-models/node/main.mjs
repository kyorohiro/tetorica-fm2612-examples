// Node.js 22+: render the same notes directly to WAV; no audio driver needed.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {OPLSynth, OPLDirectTransport, OPL_PRESETS} from 'tetorica-fm2612/opl_synth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const kind = process.argv[3] ?? 'ym3812';
if (!['ym3526', 'ym3812', 'y8950', 'ymf262'].includes(kind)) throw new RangeError('Chip must be ym3526, ym3812, y8950 or ymf262');
const chip = await createSoundChip(kind);
const transport = new OPLDirectTransport(chip, {chip: kind});
const opl = new OPLSynth({chip: kind, transport});
try {
  const sampleRate = transport.sampleRate(); // Native PCM rate at the model's standard clock.
  const chunks = [];
  let elapsedSeconds = 0, renderedFrames = 0;
  // Rendering advances the chip's sample clock immediately; no wall-clock sleep.
  function renderSeconds(seconds) {
    elapsedSeconds += seconds;
    const endFrame = Math.round(elapsedSeconds * sampleRate);
    chunks.push(transport.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  opl.initialize();
  console.log(opl.chip, `${opl.channels} physical channels`, 'A4 = MIDI 69 = 440 Hz');
  opl.setPreset(0, OPL_PRESETS.sine);
  opl.noteOn(0, 'A4');
  renderSeconds(0.55);
  opl.noteOff(0);
  renderSeconds(0.12);

  opl.setPreset(0, OPL_PRESETS.bell);
  for (const note of ['C4', 'E4', 'G4', 'C5']) {
    opl.noteOn(0, note);
    renderSeconds(0.28);
    opl.noteOff(0);
    renderSeconds(0.06);
  }

  opl.setPreset(0, OPL_PRESETS.organ);
  opl.setOperator(0, 0, {multi: 2, tl: 24});
  for (const note of ['E4', 'G4', 'C5']) {
    opl.noteOn(0, note);
    renderSeconds(0.22);
    opl.noteOff(0);
    renderSeconds(0.06);
  }
  opl.allNotesOff();
  renderSeconds(0.35);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/opl-models.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.3}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · ${kind}`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip and never owns its lifetime.
}

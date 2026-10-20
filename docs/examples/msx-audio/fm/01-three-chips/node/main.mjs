// Node.js 22+: independent native chips mixed offline; no audio device or audify.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {AY8910Synth, AY8910DirectTransport, AY8910_CLOCK} from 'tetorica-fm2612/ay8910synth.js';
import {YM2413Synth, YM2413DirectTransport} from 'tetorica-fm2612/ym2413synth.js';
import {OPLSynth, OPLDirectTransport, OPL_PRESETS} from 'tetorica-fm2612/opl_synth.js';
import {ChipPCMRenderer} from 'tetorica-fm2612/chip_pcm_renderer.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const sampleRate = 44100, bpm = 120;
const chips = [];
try {
  // Construction is sequential so finally also releases partially loaded sets.
  const ayChip = await createSoundChip('ay8910', {clock: AY8910_CLOCK, sampleRate});
  chips.push(ayChip);
  const opllChip = await createSoundChip('ym2413');
  chips.push(opllChip);
  const oplChip = await createSoundChip('y8950');
  chips.push(oplChip);
  const ayTransport = new AY8910DirectTransport(ayChip);
  const opllTransport = new YM2413DirectTransport(opllChip);
  const oplTransport = new OPLDirectTransport(oplChip, {chip: 'y8950'});
  const ay = new AY8910Synth({transport: ayTransport});
  const opll = new YM2413Synth({transport: opllTransport});
  const opl = new OPLSynth({chip: 'y8950', transport: oplTransport});
  const transports = [ayTransport, opllTransport, oplTransport];
  const synths = [ay, opll, opl];
  for (const synth of synths) synth.initialize();
  // Each renderer keeps its own fractional source phase across note boundaries.
  // AY is 44,100 Hz here; OPLL/OPL use their native clock-derived PCM rates.
  const renderers = transports.map(transport => new ChipPCMRenderer(transport, {sampleRate, gain: 0.4}));
  console.log('MSX Audio', 'native PCM rates:', transports.map(transport => transport.sampleRate()));
  const chunks = [];
  let elapsedBeats = 0, renderedFrames = 0;
  function renderBeats(beats) {
    elapsedBeats += beats;
    const endFrame = Math.round(elapsedBeats * 60 / bpm * sampleRate);
    const frames = endFrame - renderedFrames;
    // Match the AY speaker transport: level-zero channels contribute exact zero,
    // rather than the normalized native DAC's silent DC baseline.
    const registers = ay.getRegisterSnapshot();
    ayChip.setMuteMask([0, 1, 2].reduce((mask, ch) => mask | ((registers[8 + ch] & 31) ? 0 : 1 << ch), 0));
    const left = new Float32Array(frames), right = new Float32Array(frames);
    for (const renderer of renderers) {
      const pcm = renderer.render(frames);
      for (let i = 0; i < frames; i++) {left[i] += pcm.left[i]; right[i] += pcm.right[i];}
    }
    chunks.push({left, right}); renderedFrames = endFrame;
  }

  ay.setVoice(0, {tone: true, noise: false, volume: 8, envelope: false});
  opll.setVoice(0, {instrument: 3, attenuation: 6, sustain: false});
  opl.setPreset(0, OPL_PRESETS.bell);
  opl.setOperator(0, 1, {tl: 28});
  const lead = ['C4', 'E4', 'G4', 'B4', 'C5', 'G4', 'E4', 'D4'];
  for (let step = 0; step < lead.length; step++) {
    ay.noteOn(0, step < 4 ? 'C3' : 'G2');
    opll.noteOn(0, lead[step]);
    opl.noteOn(0, step < 4 ? 'G4' : 'D4');
    renderBeats(0.7);
    ay.keyOff(0); opll.keyOff(0);
    opl.keyOff(0);
    renderBeats(0.3);
  }
  for (const synth of synths) synth.allNotesOff();
  renderBeats(2); // One second of release tail, matching the Web program.

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/msx-audio-fm-01-three-chips.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.6}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · AY + YM2413 + Y8950`);
} finally {
  // DirectTransports borrow the native chips; these handles own their lifetime.
  for (const chip of chips.reverse()) chip.dispose();
}

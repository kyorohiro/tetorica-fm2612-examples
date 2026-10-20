// Offline OPL3 four-operator routes, at the native chip sample rate.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {OPLSynth, OPLDirectTransport, OPL_PRESETS} from 'tetorica-fm2612/opl_synth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ymf262');
try {
  const transport = new OPLDirectTransport(chip, {chip: 'ymf262'});
  const opl = new OPLSynth({chip: 'ymf262', transport});
  opl.initialize();
  const sampleRate = transport.sampleRate(), chunks = [];
  let seconds = 0, renderedFrames = 0;
  function render(duration) {
    seconds += duration;
    const endFrame = Math.round(seconds * sampleRate);
    chunks.push(chip.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  // Each primary borrows CH+3. The paired secondary receives no direct notes.
  for (const channel of [0, 9]) {
    opl.setPreset(channel, OPL_PRESETS['four-op-bell']);
    for (let operator = 0; operator < 4; operator++) {
      opl.setOperator(channel, operator, {multi: operator < 2 ? 1 : 2, tl: operator % 2 ? 24 : 32, egt: true, dr: 0, sl: 0, rr: 14});
    }
  }
  opl.setPan(0, true, false); // Primary 0 + secondary 3: left only.
  opl.setPan(9, false, true); // Primary 9 + secondary 12: right only.
  for (const algorithm of [0, 1, 2, 3]) {
    for (const [channel, note] of [[0, 'C4'], [9, 'E4']]) {
      opl.setAlgo(channel, algorithm, 1);
      opl.noteOn(channel, note);
      render(0.32);
      opl.keyOff(channel);
      render(0.12); // Release before the next speaker's voice begins.
    }
  }
  opl.allNotesOff();
  render(0.6);
  opl.setFourOp(0, false);
  opl.setFourOp(9, false);

  const frames = chunks.reduce((total, chunk) => total + chunk.left.length, 0);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/opl3-fm-01-four-operators.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.3}));
  console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · YMF262`);
} finally {
  chip.dispose();
}

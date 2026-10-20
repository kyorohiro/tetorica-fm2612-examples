// Node.js 22+: offline OPL2 audio. No AudioContext, audify or audio device.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {OPLSynth, OPLDirectTransport, OPL_PRESETS} from 'tetorica-fm2612/opl_synth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ym3812');
const transport = new OPLDirectTransport(chip, {chip: 'ym3812'});
const opl = new OPLSynth({chip: 'ym3812', transport});
try {
  const sampleRate = transport.sampleRate();
  const chunks = [];
  let elapsedSeconds = 0, renderedFrames = 0;
  function renderSeconds(seconds) {
    elapsedSeconds += seconds;
    const endFrame = Math.round(elapsedSeconds * sampleRate);
    chunks.push(transport.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  opl.initialize(); // Also enables OPL2 waveform selection.
  for (const algorithm of [0, 1]) {
    console.log(algorithm === 0 ? 'FM: modulator → carrier' : 'Additive: modulator + carrier');
    opl.setPreset(0, OPL_PRESETS.organ);
    opl.setOperator(0, 0, {multi: 2, tl: 24});
    opl.setOperator(0, 1, {multi: 1, tl: 20});
    opl.setAlgo(0, algorithm, 0);
    opl.noteOn(0, 'A3');
    renderSeconds(0.55);
    opl.noteOff(0);
    renderSeconds(0.1);
  }

  for (const waveform of [0, 1, 2, 3]) {
    console.log('Carrier waveform', waveform);
    opl.setPreset(0, OPL_PRESETS.sine);
    opl.setOperator(0, 1, {waveform, tl: 18});
    opl.noteOn(0, 'A4');
    renderSeconds(0.45);
    opl.noteOff(0);
    renderSeconds(0.08);
  }

  console.log('Deep hardware AM + vibrato: fixed-rate LFO');
  opl.setPreset(0, OPL_PRESETS.organ);
  opl.setOperator(0, 1, {am: true, vibrato: true});
  opl.setLFO({amDepth: true, pmDepth: true});
  opl.noteOn(0, 'A4');
  renderSeconds(0.9);
  opl.allNotesOff();
  renderSeconds(0.3);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/opl2-operators.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.3}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · YM3812`);
} finally {
  chip.dispose();
}

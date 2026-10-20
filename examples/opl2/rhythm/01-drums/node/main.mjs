// Offline PCM at the YM3812's native sample rate; no audio driver is needed.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {OPLSynth, OPLDirectTransport} from 'tetorica-fm2612/opl_synth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ym3812');
try {
  const transport = new OPLDirectTransport(chip, {chip: 'ym3812'});
  const opl = new OPLSynth({chip: 'ym3812', transport});
  opl.initialize();
  const sampleRate = transport.sampleRate(), chunks = [];
  let seconds = 0, renderedFrames = 0;
  function render(duration) {
    seconds += duration;
    const endFrame = Math.round(seconds * sampleRate);
    chunks.push(chip.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  // Physical channels 6, 7 and 8 become five percussion voices.
  const drumOperator = {multi: 1, tl: 25, ar: 15, dr: 9, sl: 15, rr: 12, egt: false, waveform: 0};
  for (const channel of [6, 7, 8]) {
    opl.setPreset(channel, {algorithm: 0, feedback: 2, operators: [{...drumOperator}, {...drumOperator}]});
  }
  opl.setNote(6, 'C2'); // Bass drum uses both operators of physical CH6.
  opl.setOperator(6, 0, {tl: 32, dr: 8});
  opl.setOperator(6, 1, {tl: 14, dr: 7});
  opl.setNote(7, 'G3'); // Hi-hat and snare share CH7.
  opl.setOperator(7, 0, {multi: 5, tl: 24, dr: 6});
  opl.setOperator(7, 1, {tl: 19, dr: 7});
  opl.setNote(8, 'D3'); // Tom and cymbal share CH8.
  opl.setOperator(8, 0, {tl: 20, dr: 8});
  opl.setOperator(8, 1, {multi: 3, tl: 27, dr: 6});
  opl.setRhythm({enabled: true});
  const pattern = [
    ['bassDrum'], ['snare'], ['tom'], ['cymbal'], ['hiHat'],
    ['bassDrum', 'hiHat'], ['hiHat'], ['snare', 'hiHat'], ['hiHat'],
    ['bassDrum', 'hiHat'], ['tom'], ['snare', 'cymbal'], ['hiHat'],
  ];
  for (let step = 0; step < pattern.length; step++) {
    const drums = pattern[step];
    opl.setRhythm(Object.fromEntries(drums.map(name => [name, true])));
    render(0.045);
    opl.setRhythm(Object.fromEntries(drums.map(name => [name, false])));
    render((step < 5 ? 0.32 : 0.22) - 0.045);
  }
  opl.allNotesOff();
  opl.setRhythm({enabled: false});
  render(0.8);

  const frames = chunks.reduce((total, chunk) => total + chunk.left.length, 0);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/opl2-rhythm-01-drums.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.3}));
  console.log(`${output}\n${frames} frames · ${sampleRate} Hz · PCM16 · YM3812 rhythm`);
} finally {
  chip.dispose(); // OPLDirectTransport borrows the chip and never disposes it.
}

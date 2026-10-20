// Node.js 22+: direct PCM to WAV. No AudioContext, audify or audio device.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2413Synth, YM2413DirectTransport, YM2413_INSTRUMENTS as OPLL_INSTRUMENTS, YM2413_USER_PRESETS as OPLL_USER_PRESETS} from 'tetorica-fm2612/ym2413synth.js';
import {ChipPCMRenderer} from 'tetorica-fm2612/chip_pcm_renderer.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const devices = [];
try {
  const chip = await createSoundChip('ym2413'); devices.push(chip);
  const transport = new YM2413DirectTransport(chip);
  const opll = new YM2413Synth({transport});
  const sampleRate = 44100;
  const renderers = [new ChipPCMRenderer(chip, {sampleRate, gain: 0.5, generate: transport.generateStereo.bind(transport)})];
  const chunks = [];
  let elapsedSeconds = 0, renderedFrames = 0;
  function render(seconds) {
    elapsedSeconds += seconds;
    const endFrame = Math.round(elapsedSeconds * sampleRate), frames = endFrame - renderedFrames;
    const left = new Float32Array(frames), right = new Float32Array(frames);
    for (const renderer of renderers) {
      const pcm = renderer.render(frames);
      for (let frame = 0; frame < frames; frame++) {left[frame] += pcm.left[frame]; right[frame] += pcm.right[frame];}
    }
    chunks.push({left, right}); renderedFrames = endFrame;
  }

  opll.initialize();
  console.log('Melody mode: all nine channels, including physical CH8');
  opll.setVoice(8, {instrument: 12, attenuation: 6});
  opll.noteOn(8, 'A4');
  render(0.35);
  opll.noteOff(8);
  render(0.12);

  // Rhythm borrows CH6..8. CH0..5 remain available for melody.
  // CH6: bass drum; CH7: hi-hat + snare; CH8: tom + cymbal.
  opll.setNote(6, 'C3');
  opll.setNote(7, 'G3');
  opll.setNote(8, 'D3');
  opll.setRhythmLevels({bassDrum: 5, snare: 5, tom: 6, cymbal: 8, hiHat: 8});
  opll.setRhythm({enabled: true});
  for (const [name, physical] of [['bassDrum', 6], ['snare', 7], ['tom', 8], ['cymbal', 8], ['hiHat', 7]]) {
    console.log(name, 'physical channel', physical);
    opll.setRhythm({[name]: true});
    render(0.045);
    opll.setRhythm({[name]: false});
    render(0.255);
  }

  opll.setVoice(0, {instrument: 4, attenuation: 7});
  const pattern = [
    ['bassDrum', 'hiHat'], ['hiHat'], ['snare', 'hiHat'], ['hiHat'],
    ['bassDrum', 'hiHat'], ['tom'], ['snare', 'cymbal'], ['hiHat'],
  ];
  console.log('Six melody channels + five drums: CH0 melody over a short pattern');
  for (let step = 0; step < pattern.length; step++) {
    const drums = pattern[step];
    opll.noteOn(0, ['A4', 'C5', 'E5', 'C5'][step % 4]);
    opll.setRhythm(Object.fromEntries(drums.map(name => [name, true])));
    render(0.045);
    opll.setRhythm(Object.fromEntries(drums.map(name => [name, false])));
    render(0.075);
    opll.noteOff(0);
    render(0.1);
  }

  opll.allNotesOff();
  opll.setRhythm({enabled: false});
  // Drum levels share CH6..8 instrument registers: explicitly restore the voice.
  opll.setVoice(8, {instrument: 12, attenuation: 6});
  console.log('Back to nine melody channels: restore CH8 Vibraphone explicitly');
  opll.noteOn(8, 'A4');
  render(0.4);
  opll.noteOff(8);
  render(0.4);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/master-system-opll-02-rhythm.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · mono OPLL`);
} finally {
  for (const device of devices.reverse()) device.dispose(); // Direct transports borrow their chips.
}

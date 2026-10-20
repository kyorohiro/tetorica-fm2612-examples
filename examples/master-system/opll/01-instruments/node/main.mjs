// Node.js 22+: direct PCM to WAV. No AudioContext, audify or audio device.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2413Synth, YM2413DirectTransport, YM2413_INSTRUMENTS as OPLL_INSTRUMENTS, YM2413_USER_PRESETS as OPLL_USER_PRESETS} from 'tetorica-fm2612/ym2413synth.js';
import {ChipPCMRenderer} from 'tetorica-fm2612/chip_pcm_renderer.js';
import {SegaPSGSynth, SegaPSGDirectTransport} from 'tetorica-fm2612/segapsgsynth.js';
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
  const psgChip = await createSoundChip('segapsg', {sampleRate}); devices.push(psgChip);
  const psg = new SegaPSGSynth({transport: new SegaPSGDirectTransport(psgChip)});
  renderers.push(new ChipPCMRenderer(psgChip, {sampleRate, gain: 0.08}));
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
  psg.reset();
  psg.allNotesOff();
  console.log('Built-in ROM voices on CH0; A4 = MIDI 69 = 440 Hz');
  for (const instrument of [1, 3, 4, 8]) {
    console.log(instrument, OPLL_INSTRUMENTS[instrument]);
    opll.setVoice(0, {instrument, attenuation: 6});
    psg.tone(0, {note: 'A2', attenuation: 13});
    opll.noteOn(0, 69);
    render(0.32);
    opll.noteOff(0);
    psg.off(0);
    render(0.08);
  }

  // There is one user patch for the entire chip, not one patch per channel.
  opll.setUserPatch(OPLL_USER_PRESETS.sine);
  opll.setVoice(0, {instrument: 0, attenuation: 7});
  opll.setVoice(1, {instrument: 0, attenuation: 9});
  opll.setVoice(2, {instrument: 4, attenuation: 11});
  opll.noteOn(0, 'A4');
  opll.noteOn(1, 'E5');
  opll.noteOn(2, 'A3'); // Built-in Flute: unaffected by shared user-patch edits.
  console.log('Shared sine: CH0 and CH1 use instrument 0; CH2 keeps its ROM Flute');
  render(0.65);
  console.log('Change the one shared patch to bell while CH0 and CH1 are held');
  opll.setUserPatch(OPLL_USER_PRESETS.bell);
  render(0.85);
  opll.allNotesOff();
  psg.allNotesOff();
  render(0.4);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const defaultPath = fileURLToPath(new URL('../../../../../output/master-system-opll-01-instruments.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · mono OPLL + Sega PSG`);
} finally {
  for (const device of devices.reverse()) device.dispose(); // Direct transports borrow their chips.
}

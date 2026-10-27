// Node.js 22+: raw WonderSwan PCM to WAV, without an audio device.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {WonderSwanSynth, WonderSwanDirectTransport} from 'tetorica-fm2612/wonderswansynth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('wonderswan', {sampleRate: 44100});
const transport = new WonderSwanDirectTransport(chip);
const ws = new WonderSwanSynth({transport, clock: chip.clock});
try {
  const sampleRate = chip.sampleRate();
  const chunks = [];
  let renderedFrames = 0;
  function renderTo(endFrame) {
    if (endFrame < renderedFrames) throw new RangeError('Cannot render backwards');
    if (endFrame > renderedFrames) chunks.push(chip.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }
  function renderSeconds(seconds) {renderTo(renderedFrames + Math.round(seconds * sampleRate));}

  ws.initialize();
  ws.setPan(3, 5, 5);
  console.log('Noise uses physical CH3; each type chooses different LFSR taps');
  for (const type of [0, 1, 3, 7]) {
    console.log('Noise type', type);
    ws.setNoise({enabled: true, type, reset: true});
    ws.noteOn(3, 'C5'); // Sets the noise clock as well as the channel gate.
    renderSeconds(0.28);
    ws.keyOff(3);
    renderSeconds(0.08);
  }
  ws.setNoise({enabled: false});
  console.log('Sweep uses physical CH2; positive register steps raise pitch');
  ws.setPan(2, 6, 6);
  for (const step of [1, -1]) {
    ws.setSweep({enabled: false});
    ws.setFrequency(2, 440); // Restore the start period before each sweep.
    ws.setSweep({enabled: true, step, time: 2});
    ws.keyOn(2);
    renderSeconds(0.65);
    ws.keyOff(2);
    renderSeconds(0.12);
  }
  ws.setSweep({enabled: false});
  ws.allNotesOff();
  renderSeconds(0.1);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Raw core PCM is unipolar. No normalization, DC filter or resampling is added.
  // Web's audio-engine midpoint correction is deliberately outside this direct example.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/wonderswan-noise-01-noise-sweep.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.25}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · raw stereo PCM16 · WonderSwan`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip; dispose its owner explicitly.
}

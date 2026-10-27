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

  ws.initialize(); // Silent defaults. Physical channels are 0..3.
  const sine = Array.from({length: 32}, (_, i) => Math.round(7.5 + 7.5 * Math.sin(i * Math.PI / 16)));
  const triangle = Array.from({length: 32}, (_, i) => i < 16 ? i : 31 - i);
  const saw = Array.from({length: 32}, (_, i) => Math.floor(i / 2));
  const pulse = Array.from({length: 32}, (_, i) => i < 8 ? 15 : 0);
  for (const [ch, wave] of [sine, triangle, saw, pulse].entries()) ws.setWaveform(ch, wave);
  ws.setPan(0, 7, 3); ws.setPan(1, 3, 7);
  ws.setPan(2, 5, 5); ws.setPan(3, 3, 3);
  console.log('4 channels; 32 samples of 0..15; A4 = 440 Hz');
  const lead = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A5', 'G5'];
  for (let i = 0; i < lead.length; i++) {
    ws.noteOn(0, lead[i]);
    ws.noteOn(1, i < 4 ? 'E4' : 'F4');
    ws.noteOn(2, i < 4 ? 'C3' : 'D3');
    ws.noteOn(3, i % 2 ? 'G3' : 'C4');
    renderSeconds(0.32);
    ws.allNotesOff();
    renderSeconds(0.08);
  }
  renderSeconds(0.1);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Raw core PCM is unipolar. No normalization, DC filter or resampling is added.
  // Web's audio-engine midpoint correction is deliberately outside this direct example.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/wonderswan-wave-01-four-channels.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.25}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · raw stereo PCM16 · WonderSwan`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip; dispose its owner explicitly.
}

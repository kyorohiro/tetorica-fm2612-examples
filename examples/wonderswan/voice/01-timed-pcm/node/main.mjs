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

  // Generate the same bounded synthetic PCM; no game audio is distributed.
  const pcmRate = 12000;
  const pcm = new Uint8Array(pcmRate);
  let phase = 0;
  for (let i = 0; i < pcm.length; i++) {
    const hz = [220, 330, 440][Math.min(2, Math.floor(i / 4000))];
    const edge = Math.min(1, i / 120, (pcm.length - 1 - i) / 360);
    phase += 2 * Math.PI * hz / pcmRate;
    pcm[i] = Math.round(128 + 80 * edge * Math.sin(phase));
  }
  ws.initialize(); ws.setVoiceMode(true); ws.writeVoice(128);
  ws.writeRegister(0x94, 15);
  renderSeconds(0.15);
  ws.keyOn(1);
  const startFrame = renderedFrames;
  for (let i = 0; i < pcm.length; i++) {
    // Render to the exact output-frame boundary BEFORE applying the next byte.
    renderTo(startFrame + Math.round(i * sampleRate / pcmRate));
    ws.writeVoice(pcm[i]);
  }
  renderTo(startFrame + Math.round(pcm.length * sampleRate / pcmRate));
  ws.keyOff(1);
  renderSeconds(0.1);
  console.log('12,000 PCM bytes; 12 kHz input; no real-time sleeps');

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Raw core PCM is unipolar. No normalization, DC filter or resampling is added.
  // Web's audio-engine midpoint correction is deliberately outside this direct example.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/wonderswan-voice-01-timed-pcm.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.25}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · raw stereo PCM16 · WonderSwan`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip; dispose its owner explicitly.
}

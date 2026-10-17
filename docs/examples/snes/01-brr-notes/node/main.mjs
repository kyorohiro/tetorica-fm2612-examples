// Node.js 22+: offline stereo WAV. No AudioContext, audify or audio device.
import {encodeWav} from 'tetorica-fm2612';
import {SnesDspCore} from 'tetorica-fm2612/spc.js';
import {SnesSynth} from 'tetorica-fm2612/snessynth.js';
import spcModuleFactory from 'tetorica-fm2612/generated/spc_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const wasmBinary = await readFile(runtimeAssetUrl('generated/spc_wasm.wasm'));
const core = await SnesDspCore.create({moduleFactory: spcModuleFactory, moduleOptions: {wasmBinary}});
try {
  const snes = new SnesSynth({core});
  const sampleRate = core.sampleRate; // Fixed native S-DSP rate: 32,000 Hz.
  // Original 16-sample loop. At PITCH 4096 it repeats at 32,000 / 16 Hz.
  const brr = new Uint8Array([0xc3, 0x13, 0x57, 0x75, 0x31, 0xfd, 0xb9, 0x9b, 0xdf]);
  const sample = snes.loadBRR(brr, {baseFrequencyHz: 2000, loopStartSamples: 0});
  for (const channel of [0, 1, 2]) {
    snes.setPreset(channel, {
      sample,
      adsr1: 0x8f, adsr2: 0xe0, gain: 127,
      volumeLeft: 90, volumeRight: 90,
    });
  }

  const bpm = 120;
  const chunks = [];
  // Rendering advances the chip clock; no real-time sleep is needed offline.
  function renderBeats(beats) {
    const frames = Math.round(beats * 60 / bpm * sampleRate);
    const left = new Float32Array(frames), right = new Float32Array(frames);
    snes.renderInto(left, right);
    chunks.push({left, right});
  }
  for (const note of ['C4', 'E4', 'G4', 'C5']) {
    snes.noteOn(0, note);
    renderBeats(0.75);
    snes.noteOff(0);
    renderBeats(0.25);
  }
  ['C4', 'E4', 'G4'].forEach((note, channel) => snes.noteOn(channel, note));
  renderBeats(2);
  snes.allNotesOff();
  renderBeats(2);

  const frames = chunks.reduce((sum, chunk) => sum + chunk.left.length, 0);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {
    left.set(chunk.left, offset); right.set(chunk.right, offset);
    offset += chunk.left.length;
  }
  const wav = encodeWav({left, right, sampleRate}, {gain: 0.25});
  const defaultPath = fileURLToPath(new URL('../../../../output/snes-01-brr-notes.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · experimental SNES S-DSP`);
} finally {
  core.dispose();
}

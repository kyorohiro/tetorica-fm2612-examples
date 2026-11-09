// Per-voice sends and one shared approximate PS1 SPU reverb, offline.
import {Ps1Spu} from 'tetorica-fm2612/ps1_spu.js';
import {Ps1Synth} from 'tetorica-fm2612/ps1synth.js';
import {encodePs1Adpcm} from 'tetorica-fm2612/ps1_adpcm_encoder.js';
import factory from 'tetorica-fm2612/generated/ps1_spu_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

if (process.argv.length > 3) throw new Error('Usage: node main.mjs [output.wav]');
const core = await Ps1Spu.create({moduleFactory: factory,
  moduleOptions: {wasmBinary: await readFile(runtimeAssetUrl('generated/ps1_spu_wasm.wasm'))}});
const spu = new Ps1Synth({core});
try {
  const sampleRate = 44100, chunks = [];
  let seconds = 0, frames = 0;
  function render(duration) {
    seconds += duration;
    const end = Math.round(seconds * sampleRate);
    chunks.push(core.generateStereo(end - frames)); frames = end;
  }
  const sourceRate = 44100, sourceFrequency = 220, sourceFrames = Math.round(sourceRate * 0.4);
const pcm = Float32Array.from({length: sourceFrames}, (_, i) => {
  const edge = Math.min(1, i / 220, (sourceFrames - 1 - i) / 220);
  return 0.55 * Math.sin(i * 2 * Math.PI * sourceFrequency / sourceRate) * Math.exp(-3 * i / sourceFrames) * edge;
});
  const encoded = encodePs1Adpcm(pcm); // Software preparation, not audio rendering.
  const sample = spu.loadADPCM(encoded.adpcm, {baseFrequencyHz: sourceFrequency});
  for (const channel of [0, 1]) {
    // Attenuate before the SPU sums voices; lowering a later Master cannot undo clipping.
    spu.setPreset(channel, {sample, volumeLeft: 0.18, volumeRight: 0.18});
    spu.setEnvelope(channel, {attackRate: 24, decayRate: 7, sustainLevel: 12,
      sustainRate: 127, sustainDecrease: true, releaseRate: 8});
  }
  const stages = [
    {name: 'Dry / sends off', preset: 'off', volumeLeft: 0.7, volumeRight: 0.7, sends: [false, false]},
    {name: 'Room / CH1 send / left return', preset: 'room', volumeLeft: 0.7, volumeRight: 0, sends: [true, false]},
    {name: 'Room / CH2 send / right return', preset: 'room', volumeLeft: 0, volumeRight: 0.7, sends: [false, true]},
    {name: 'Room / both sends / both returns', preset: 'room', volumeLeft: 0.45, volumeRight: 0.45, sends: [true, true]},
    {name: 'Hall / CH1 send / unequal returns', preset: 'hall', volumeLeft: 0.5, volumeRight: 0.25, sends: [true, false]},
  ];
  for (const {name, sends, ...settings} of stages) {
    // Clear old tails, preserving RAM/sample IDs/voice settings, so comparisons are independent.
    spu.stopVoices(); spu.setReverb(settings);
    for (const channel of [0, 1]) spu.setPreset(channel, {reverb: sends[channel]});
    console.log(name);
    spu.noteOn(0, 'C5'); spu.noteOn(1, 'C4'); render(0.25);
    spu.allNotesOff(); render(0.75); // Dry finishes; wet tail continues.
  }
  spu.stopVoices(); render(0.2); // Exact silent end, including effect tails.
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let at = 0;
  for (const chunk of chunks) { left.set(chunk.left, at); right.set(chunk.right, at); at += chunk.left.length; }
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/ps1-spu-02-reverb.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.6}));
  console.log(`${output}\n${frames} frames · 44100 Hz · stereo PCM16 · 5.2 seconds`);
} finally { spu.dispose(); }

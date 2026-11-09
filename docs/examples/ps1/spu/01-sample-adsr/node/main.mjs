// CPU-free offline PS1 SPU, using only the published npm package.
import {Ps1Spu} from 'tetorica-fm2612/ps1_spu.js';
import {Ps1Synth} from 'tetorica-fm2612/ps1synth.js';
import {encodePs1AdpcmCycle} from 'tetorica-fm2612/ps1_adpcm_encoder.js';
import {renderPs1SampleComparison} from 'tetorica-fm2612/playground_sample_ps1.js';
import {renderPs1SamplePreview} from 'tetorica-fm2612/playground_sample_ps1_preview.js';
import factory from 'tetorica-fm2612/generated/ps1_spu_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

if (process.argv.length > 3) throw new Error('Usage: node main.mjs [output.wav]');
const wasmBinary = await readFile(runtimeAssetUrl('generated/ps1_spu_wasm.wasm'));
const core = await Ps1Spu.create({moduleFactory: factory, moduleOptions: {wasmBinary}});
const spu = new Ps1Synth({core});
try {
  const sampleRate = 44100, chunks = [];
  let seconds = 0, frames = 0;
  function render(duration) {
    seconds += duration;
    const end = Math.round(seconds * sampleRate);
    chunks.push(core.generateStereo(end - frames)); frames = end;
  }
  // SOFTWARE preparation, before rendering: 112 normalized PCM values -> 64 bytes.
  const pcm = Float32Array.from({length: 112}, (_, i) => 0.55 * Math.sin(i * 2 * Math.PI / 112));
  const encoded = encodePs1AdpcmCycle(pcm);
  // Optional SAMPLE EDITOR helpers, separate from this live instrument:
  // comparison reconstructs packets in software; preview uses/disposes its own
  // actual SPU instance and never opens a device or changes `core` above.
  const audio = {sampleRate, channels: [pcm]};
  const edit = {rootMidi: 67, tuneCents: 1200 * Math.log2((sampleRate / 112) / (440 * 2 ** ((67 - 69) / 12))),
    loopEnabled: true, loopStartFrame: 0, loopEndFrame: 112};
  const comparison = renderPs1SampleComparison(audio, edit);
  const preview = await renderPs1SamplePreview(audio, edit, {moduleFactory: factory, moduleOptions: {wasmBinary}});
  console.log(`Software comparison: ${comparison.sourceFrameCount} source / ${comparison.decodedFrameCount} reconstructed frames, RMS error ${comparison.metrics.rmsError}`);
  console.log(`Isolated actual-SPU preview: ${preview.channels[0].length} frames at ${preview.sampleRate} Hz; main instrument remains untouched`);
  const sample = spu.loadADPCM(encoded.adpcm, {baseFrequencyHz: sampleRate / 112, loopStartSamples: 0});
  spu.setPreset(0, {sample, volumeLeft: 0.28, volumeRight: 0.28});
  spu.setEnvelope(0, {attackRate: 40, attackExponential: false, decayRate: 7,
    sustainLevel: 10, sustainRate: 127, sustainDecrease: true, sustainExponential: false,
    releaseRate: 8, releaseExponential: false});
  console.log(`${encoded.sourceFrames} original PCM frames -> ${encoded.adpcm.length} SPU ADPCM bytes; base ${sampleRate / 112} Hz`);
  spu.noteOn(0, 'A4'); render(1.0);
  const before = spu.getState().channels[0].envelope;
  spu.setEnvelope(0, {sustainRate: 64}, {live: true}); render(0.8);
  const after = spu.getState().channels[0].envelope;
  console.log(`Held-note live Sustain rate: envelope ${before} -> ${after}; no key-on or sample restart`);
  spu.setEnvelope(0, {sustainRate: 127}, {live: true}); render(0.4);
  spu.keyOff(0); render(0.3);
  for (const note of ['C4', 'E4', 'G4']) {
    spu.noteOn(0, note); render(0.35); spu.keyOff(0); render(0.15);
  }
  // Transport Stop is different from keyOff: it also clears all effect history.
  spu.stopVoices(); render(0.2);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let at = 0;
  for (const chunk of chunks) { left.set(chunk.left, at); right.set(chunk.right, at); at += chunk.left.length; }
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/ps1-spu-01-sample-adsr.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  // Voice gain creates headroom BEFORE the SPU's internal mix; host gain once.
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.6}));
  console.log(`${output}\n${frames} frames · 44100 Hz · stereo PCM16 · 4.2 seconds`);
} finally { spu.dispose(); } // Ps1Synth owns/disposes this core.

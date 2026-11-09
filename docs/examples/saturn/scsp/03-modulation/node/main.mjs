// Node.js 22+: fixed 44.1 kHz offline SCSP. No audio device, CPU or SSF.
import {Scsp} from 'tetorica-fm2612/scsp.js';
import {ScspSynth} from 'tetorica-fm2612/scspsynth.js';
import {prepareScspPCM} from 'tetorica-fm2612/scsp_sample.js';
import moduleFactory from 'tetorica-fm2612/generated/scsp_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const core = await Scsp.create({moduleFactory, moduleOptions:{
  wasmBinary:await readFile(runtimeAssetUrl('generated/scsp_wasm.wasm')),
}});
const saturn = new ScspSynth(core); // Exclusive ownership; dispose also frees core.
const sampleRate = 44100, chunks = [];
let seconds = 0, frames = 0;
function render(duration) {
  seconds += duration;
  const end = Math.round(seconds * sampleRate);
  chunks.push(saturn.generateStereo(end - frames)); frames = end;
}
try {
  const pcm = Int16Array.from({length:64}, (_, i) => Math.round(8192 * Math.sin(2 * Math.PI * i / 64)));
  // Full loop + periodic guard copies protect reads even at maximum allowed depth.
  const sample = saturn.loadPCM(pcm, {
    baseFrequencyHz:44100/64, loopStartSamples:0, modulationDepth:12,
  });
  // Append-only allocation: this unrelated sample does not replace the first.
  const neighbor = saturn.loadPCM(new Int16Array(257).fill(24000), {rootNote:'A4'});
  if (sample.id === neighbor.id) throw new Error('Samples must remain independent');
  saturn.setPreset(0, {sample, directLevel:0, totalLevel:0}); // Silent helper.
  saturn.setPreset(1, {sample, totalLevel:24,
    modulation:{depth:9, xOffset:63, yOffset:63, writeInhibit:false}});
  // Offsets are relative 64-word sound-stack addresses, NOT slot IDs.
  // In this pinned zero-slot-write-delay core, 63 reads the preceding slot now;
  // 31 reads that slot's previous frame. Exact physical timing is not claimed.
  saturn.noteOn(0, 'A4');
  saturn.noteOn(1, 'A3');
  for (const depth of [0, 9, 12, 0]) {
    saturn.setModulation(1, {depth}); render(0.65);
    console.log(`Carrier slot 1, depth ${depth}; helper slot 0 output muted`);
  }
  saturn.setModulation(1, {depth:9, xOffset:31, yOffset:31}); render(0.6);
  saturn.setMix(0, {directLevel:7}); render(0.6); // Hear the helper without changing its stack writes.
  saturn.setMix(0, {directLevel:0});
  const state = saturn.getState();
  if (state.samples.length !== 2 || state.playingSampleIds[0] !== sample.id || state.playingSampleIds[1] !== sample.id)
    throw new Error('The neighbor must not replace the guarded sample');
  console.log('Two retained samples; modulated read uses periodic guard copies, not neighbor PCM');
  saturn.allNotesOff(); render(0.4);
} finally { saturn.dispose(); }
const left = new Float32Array(frames), right = new Float32Array(frames);
let offset = 0;
for (const chunk of chunks) { left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length; }
if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Invalid PCM');
const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../../output/saturn-scsp-03-modulation.wav', import.meta.url));
await mkdir(dirname(output), {recursive:true});
await writeFile(output, encodeWav({left, right, sampleRate}, {gain:0.35}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · SCSP`);

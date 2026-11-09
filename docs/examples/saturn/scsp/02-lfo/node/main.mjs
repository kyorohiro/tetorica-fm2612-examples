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
  const pcm = Int16Array.from({length:128}, (_, i) => Math.round(11000 * Math.sin(2 * Math.PI * i / 128)));
  const sample = saturn.loadPCM(pcm, {baseFrequencyHz:44100/128, loopStartSamples:0});
  saturn.setPreset(0, {sample, totalLevel:24,
    lfo:{frequencyCode:20, pitchWave:2, pitchDepth:5,
      amplitudeWave:2, amplitudeDepth:4, reset:false}});
  saturn.noteOn(0, 'A3');
  saturn.setLfo(0, {pitchDepth:0, amplitudeDepth:0}); render(0.5);
  saturn.setLfo(0, {pitchDepth:5, amplitudeDepth:4}); render(0.8);
  saturn.setLfo(0, {reset:true}); render(0.5); // Held, NOT a one-shot reset.
  saturn.setLfo(0, {reset:false}); render(0.8);
  for (const wave of [0, 1, 2, 3]) {
    saturn.setLfo(0, {pitchWave:wave, amplitudeWave:wave, frequencyCode:22});
    render(0.35);
  }
  console.log('Live LFO: dry / modulated / reset hold / resume / four waves; no retrigger');
  saturn.allNotesOff(); render(0.4);
} finally { saturn.dispose(); }
const left = new Float32Array(frames), right = new Float32Array(frames);
let offset = 0;
for (const chunk of chunks) { left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length; }
if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Invalid PCM');
const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../../output/saturn-scsp-02-lfo.wav', import.meta.url));
await mkdir(dirname(output), {recursive:true});
await writeFile(output, encodeWav({left, right, sampleRate}, {gain:0.35}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · SCSP`);

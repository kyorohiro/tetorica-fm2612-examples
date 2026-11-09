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
  // Software selection/conversion; this helper is not SCSP hardware.
  const sourceRate = 28160, length = 128; // One period = 220 Hz, not guessed from PCM.
  const audio = {sampleRate:sourceRate, channels:[Float32Array.from({length}, (_, i) =>
    0.32 * Math.sin(2 * Math.PI * i / length) + 0.06 * Math.sin(6 * Math.PI * i / length))]};
  const samples = [];
  for (const bits of [8, 16]) {
    const draft = prepareScspPCM(audio, {startSeconds:0, endSeconds:length/sourceRate,
      sourceSampleRate:sourceRate, rootNote:'A3', bits});
    samples.push(saturn.loadPCM(draft.pcm, {
      baseFrequencyHz:draft.sample.rootFrequencyHz,
      sourceSampleRate:draft.sample.sourceSampleRate, loopStartSamples:0,
    }));
  }
  const envelope = {attackRate:31, decay1Rate:8, decay2Rate:0,
    decayLevel:8, releaseRate:24, keyRateScaling:15};
  // 32 physical slots, no automatic allocator. Slot 31 is the last valid slot.
  for (const slot of [0, 1, 31]) saturn.setPreset(slot, {
    sample:samples[slot === 0 ? 0 : 1], envelope, totalLevel:24, directLevel:0,
  });
  
  for (const slot of [0, 1, 31]) {
    for (const other of [0, 1, 31]) saturn.setMix(other, {directLevel:0});
    saturn.setMix(slot, {directLevel:7});
    console.log(`PCM${slot === 0 ? 8 : 16}, physical slot ${slot}, A3 then A4`);
    saturn.noteOn(slot, 'A3'); render(0.45);
    saturn.setNote(slot, 'A4'); render(0.35); // Live pitch, same gate.
    saturn.keyOff(slot); render(0.25);
  }
  saturn.allNotesOff(); render(0.4);
} finally { saturn.dispose(); }
const left = new Float32Array(frames), right = new Float32Array(frames);
let offset = 0;
for (const chunk of chunks) { left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length; }
if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Invalid PCM');
const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../../output/saturn-scsp-01-pcm.wav', import.meta.url));
await mkdir(dirname(output), {recursive:true});
await writeFile(output, encodeWav({left, right, sampleRate}, {gain:0.35}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · SCSP`);

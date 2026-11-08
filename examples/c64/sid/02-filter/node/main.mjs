// Node.js 22+: SID's one shared hardware filter, rendered offline.
import {SidCore, SID_PAL_CLOCK} from 'tetorica-fm2612/sid.js';
import {Sid8580Core} from 'tetorica-fm2612/sid8580.js';
import {SidSynth} from 'tetorica-fm2612/sidsynth.js';
import {encodeWav} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const sampleRate = 48000, outputGain = 0.35;
let model = 'both', outputPath;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--model=')) model = arg.slice(8);
  else if (!arg.startsWith('--') && !outputPath) outputPath = arg;
  else throw new Error('Usage: node main.mjs [output.wav] [--model=6581|8580|both]');
}
if (!['6581', '8580', 'both'].includes(model)) throw new RangeError('model must be 6581, 8580 or both');
const models = model === 'both' ? ['6581', '8580'] : [model];
const stages = [
  {name: 'Dry', mode: 'off', routing: 0, cutoff: 700, resonance: 5},
  {name: 'LP', mode: 'lowpass', routing: 7, cutoff: 700, resonance: 5},
  {name: 'BP', mode: 'bandpass', routing: 7, cutoff: 700, resonance: 5},
  {name: 'HP', mode: 'highpass', routing: 7, cutoff: 700, resonance: 5},
  {name: 'Notch = LP + HP', mode: 'notch', routing: 7, cutoff: 700, resonance: 5},
  {name: 'LP + BP + HP', mode: 'lowpass+bandpass+highpass', routing: 7, cutoff: 700, resonance: 5},
  {name: 'LP, higher Cutoff code', mode: 'lowpass', routing: 7, cutoff: 1400, resonance: 5},
  {name: 'LP, higher Resonance', mode: 'lowpass', routing: 7, cutoff: 700, resonance: 10},
];
const chunks = [];
for (const name of models) {
  const Core = name === '8580' ? Sid8580Core : SidCore;
  const wasmPath = name === '8580' ? 'generated/sid8580-machine/sid8580-endpoint.wasm' : 'generated/sid/sid.wasm';
  const core = await Core.create({sampleRate, clockHz: SID_PAL_CLOCK, wasmBinary: await readFile(runtimeAssetUrl(wasmPath))});
  const sid = new SidSynth({core});
  let seconds = 0, renderedFrames = 0;
  function render(duration) {
    seconds += duration;
    const endFrame = Math.round(seconds * sampleRate);
    chunks.push(core.render(endFrame - renderedFrames)); renderedFrames = endFrame;
  }
  try {
    sid.initialize();
    for (let channel = 0; channel < 3; ++channel) {
      sid.setVoice(channel, {waveform: 'saw', attack: 0, decay: 0, sustain: 10, release: 4});
    }
    sid.setFilter({mode: 'off', routing: 0, volume: 10});
    for (const [channel, note] of ['A3', 'E4', 'A4'].entries()) sid.noteOn(channel, note);
    console.log(`SID ${name}${name === '8580' ? ' Preview' : ''} · same chord and register settings`);
    for (const {name: label, ...settings} of stages) {
      console.log(`${label} · Cutoff code ${settings.cutoff} · Resonance ${settings.resonance}`);
      sid.setFilter({...settings, volume: 10}); render(0.60);
    }
    sid.allNotesOff(); render(0.60);
  } finally {
    sid.dispose(); core.dispose();
  }
}
const frames = chunks.reduce((total, pcm) => total + pcm.length, 0), mono = new Float32Array(frames);
let offset = 0;
for (const pcm of chunks) { mono.set(pcm, offset); offset += pcm.length; }
const output = outputPath ? resolve(outputPath) : fileURLToPath(new URL('../../../../../output/c64-sid-02-filter.wav', import.meta.url));
await mkdir(dirname(output), {recursive: true});
await writeFile(output, encodeWav({left: mono, right: mono, sampleRate}, {gain: outputGain}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 (duplicated mono) · models ${models.join(' then ')}`);

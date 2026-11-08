// Node.js 22+: CPU-free offline SID WAV. No audio device, C64 CPU, ROM or song.
import {SidCore, SID_PAL_CLOCK} from 'tetorica-fm2612/sid.js';
import {Sid8580Core} from 'tetorica-fm2612/sid8580.js';
import {SidSynth} from 'tetorica-fm2612/sidsynth.js';
import {encodeWav} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const sampleRate = 48000, outputGain = 0.35;
const args = process.argv.slice(2);
let model = 'both', outputPath;
for (const arg of args) {
  if (arg.startsWith('--model=')) model = arg.slice(8);
  else if (!arg.startsWith('--') && !outputPath) outputPath = arg;
  else throw new Error('Usage: node main.mjs [output.wav] [--model=6581|8580|both]');
}
if (!['6581', '8580', 'both'].includes(model)) throw new RangeError('model must be 6581, 8580 or both');
const models = model === 'both' ? ['6581', '8580'] : [model];
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
    sid.initialize(); sid.setFilter({mode: 'off', routing: 0, volume: 10});
    sid.setVoice(0, {waveform: 'triangle', attack: 0, decay: 4, sustain: 10, release: 4});
    sid.setVoice(1, {waveform: 'saw', attack: 4, decay: 6, sustain: 8, release: 5});
    sid.setVoice(2, {waveform: 'pulse', pulseWidth: 1024, attack: 7, decay: 3, sustain: 11, release: 6});
    const notes = ['A4', 'E4', 'A3'];
    console.log(`SID ${name}${name === '8580' ? ' Preview' : ''} · PAL ${SID_PAL_CLOCK} Hz`);
    for (let channel = 0; channel < 3; ++channel) {
      console.log(`CH${channel + 1}: ${notes[channel]}`);
      sid.noteOn(channel, notes[channel]); render(0.45);
      sid.keyOff(channel); render(0.30);
    }
    for (let channel = 0; channel < 3; ++channel) sid.noteOn(channel, notes[channel]);
    render(1.20); sid.allNotesOff(); render(0.60);
  } finally {
    sid.dispose(); core.dispose(); // SidSynth borrows the core.
  }
}
const frames = chunks.reduce((total, pcm) => total + pcm.length, 0), mono = new Float32Array(frames);
let at = 0;
for (const pcm of chunks) { mono.set(pcm, at); at += pcm.length; }
const output = outputPath ? resolve(outputPath) : fileURLToPath(new URL('../../../../../output/c64-sid-01-voices.wav', import.meta.url));
await mkdir(dirname(output), {recursive: true});
// A physical SID is mono. Duplicate into the stereo WAV; apply gain once.
await writeFile(output, encodeWav({left: mono, right: mono, sampleRate}, {gain: outputGain}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 (duplicated mono) · models ${models.join(' then ')}`);

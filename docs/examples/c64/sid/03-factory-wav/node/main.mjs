// Node.js 22+: one SID note -> PCM -> WAV. No audio device or C64 program.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {SidSynth} from 'tetorica-fm2612/sidsynth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

let model = 'both', outputPath;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--model=')) model = arg.slice(8);
  else if (!arg.startsWith('--') && !outputPath) outputPath = arg;
  else throw new Error('Usage: node main.mjs [output.wav] [--model=6581|8580|both]');
}
if (!['6581', '8580', 'both'].includes(model)) throw new RangeError('model must be 6581, 8580 or both');

const sampleRate = 48000, models = model === 'both' ? ['6581', '8580'] : [model];
const mono = new Float32Array(models.length * sampleRate * 0.75);
for (const [index, name] of models.entries()) {
  // The common factory loads only this model's packaged WASM, also in Node.
  const core = await createSoundChip('sid', {model: name, sampleRate});
  const sid = new SidSynth({core});
  try {
    sid.initialize();
    sid.setVoice(0, {waveform: 'triangle', attack: 0, decay: 4, sustain: 10, release: 4});
    sid.noteOn(0, 'A4');
    const at = index * sampleRate * 0.75;
    mono.set(core.render(sampleRate * 0.5), at); // render() advances chip time.
    sid.noteOff(0);
    mono.set(core.render(sampleRate * 0.25), at + sampleRate * 0.5);
    console.log(`SID ${name} · ${core.clockHz} Hz · A4 then Release`);
  } finally {
    sid.dispose();
    core.dispose(); // SidSynth borrows the core; the caller releases it.
  }
}

const output = outputPath ? resolve(outputPath)
  : fileURLToPath(new URL('../../../../../output/c64-sid-03-factory-wav.wav', import.meta.url));
await mkdir(dirname(output), {recursive: true});
// SID is mono. Duplicate to stereo PCM16, applying host gain once.
await writeFile(output, encodeWav({left: mono, right: mono, sampleRate}, {gain: 0.35}));
console.log(`${output}\n${mono.length} frames · ${sampleRate} Hz · models ${models.join(' then ')}`);

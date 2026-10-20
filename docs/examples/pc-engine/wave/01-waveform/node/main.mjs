// Node.js 22+: offline WAV. No AudioContext, audify or audio device.
import {encodeWav} from 'tetorica-fm2612';
import {Huc6280AudioEngine} from 'tetorica-fm2612/huc6280audioengine.js';
import {Huc6280Synth, Huc6280DirectTransport, HUC6280_CLOCK} from 'tetorica-fm2612/huc6280synth.js';
import moduleFactory from 'tetorica-fm2612/generated/huc6280_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const wasmBinary = await readFile(runtimeAssetUrl('generated/huc6280_wasm.wasm'));
const chip = await Huc6280AudioEngine.create({
  moduleFactory: () => moduleFactory({wasmBinary}),
  clock: HUC6280_CLOCK, // 3,579,545 Hz PSG clock, not the full master oscillator.
  outputSampleRate: 44100,
});
const pce = new Huc6280Synth({transport: new Huc6280DirectTransport(chip)});
try {
  pce.initialize();
  const sampleRate = chip.sampleRate();
  const bpm = 120;
  const chunks = [];
  let elapsedBeats = 0, renderedFrames = 0;
  // Cumulative rounding preserves fractional frames at every note boundary.
  function renderBeats(beats) {
    elapsedBeats += beats;
    const endFrame = Math.round(elapsedBeats * 60 / bpm * sampleRate);
    chunks.push(chip.processFrames(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  const waveforms = [
    ['Sine · left', Array.from({length: 32}, (_, i) => Math.round(15.5 + 15.5 * Math.sin(i * Math.PI / 16))), 15, 0],
    ['Triangle · center', Array.from({length: 32}, (_, i) => i < 16 ? i * 2 : 63 - i * 2), 15, 15],
    ['Sawtooth · right', Array.from({length: 32}, (_, i) => i), 0, 15],
  ];
  pce.setVolume(0, 26);
  for (const [name, waveform, left, right] of waveforms) {
    console.log(name);
    pce.setWaveform(0, waveform); // Upload stops the channel; noteOn restarts it.
    pce.setPan(0, left, right);
    for (const note of ['C4', 'E4', 'G4', 'C5']) {
      pce.noteOn(0, note);
      renderBeats(0.5); // Change pitch without cutting the key between notes.
    }
  }
  pce.allNotesOff();
  renderBeats(2);

  const frames = chunks.reduce((total, chunk) => total + chunk.left.length, 0);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {
    left.set(chunk.left, offset); right.set(chunk.right, offset);
    offset += chunk.left.length;
  }
  const wav = encodeWav({left, right, sampleRate}, {gain: 0.5});
  const defaultPath = fileURLToPath(new URL('../../../../../output/pc-engine-wave-01-waveform.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · HuC6280`);
} finally {
  pce.dispose(); // Direct transport borrows the engine; release both explicitly.
  chip.dispose();
}

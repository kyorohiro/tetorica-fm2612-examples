import {encodeWav} from 'tetorica-fm2612';
// Run this file from the repository root with Node.js 22+.
import {GameboyApu} from 'tetorica-fm2612/gameboyapu.js';
import moduleFactory from 'tetorica-fm2612/generated/gameboy_apu_wasm.js';
import {GameboySynth, GameboyDirectTransport} from 'tetorica-fm2612/gameboysynth.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/gameboy_apu_wasm.wasm'));
const chip = await GameboyApu.create({moduleFactory, moduleOptions: {wasmBinary}});
try {
  const sampleRate = chip.sampleRate();
  const gb = new GameboySynth({transport: new GameboyDirectTransport(chip)});
  gb.initialize();
  const segments = [];
  for (const duty of [0.125, 0.25, 0.5, 0.75]) {
    gb.pulse.setVoice(0, {duty, volume: 10, envelope: {direction: 'down', period: 0}});
    gb.pulse.setNote(0, 'C4');
    gb.pulse.keyOn(0);
    segments.push(chip.generateStereo(Math.round(sampleRate * 0.3)));
    gb.pulse.keyOff(0);
    segments.push(chip.generateStereo(Math.round(sampleRate * 0.1)));
  }
  gb.dispose();
  // Concatenate the generated segments in their original order.
  const frames = segments.reduce((sum, segment) => sum + segment.left.length, 0);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let offset = 0;
  for (const segment of segments) {
    left.set(segment.left, offset);
    right.set(segment.right, offset);
    offset += segment.left.length;
  }

  // Encode and save stereo PCM16. No audio driver is required.
  const wav = encodeWav({left, right, sampleRate}, {gain: 0.25});
  const defaultPath = fileURLToPath(new URL('../../../../../output/gameboy-pulse-01-duty.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

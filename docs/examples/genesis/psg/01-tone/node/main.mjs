import {encodeWav} from 'tetorica-fm2612';
// Run this file from the repository root with Node.js 22+.
import {SegaPSG} from 'tetorica-fm2612/segapsg.js';
import moduleFactory from 'tetorica-fm2612/generated/segapsg_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/segapsg_wasm.wasm'));
const chip = await SegaPSG.create({moduleFactory, moduleOptions: {wasmBinary}});
try {
  // Mute all four channels before configuring the example.
  for (const value of [0x9f, 0xbf, 0xdf, 0xff]) chip.write(value);
  const sampleRate = chip.sampleRate();
  const segments = [];
  // PSG tone frequency = clock / (32 * divider).
  const divider = Math.round(3579545 / (32 * 440));
  chip.write(0x80 | (divider & 0x0f)); // latch tone channel 0, low 4 bits
  chip.write((divider >> 4) & 0x3f);  // high 6 bits
  chip.write(0x94);                    // channel 0 attenuation 4
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
  chip.write(0x9f);                    // mute channel 0
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.2)));
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
  const defaultPath = fileURLToPath(new URL('../../../../../output/genesis-psg-01-tone.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

// Run this file from the repository root with Node.js 22+.
import {createSoundChip} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/ym2612_wasm.wasm'));
const chip = await createSoundChip('ym2612', {moduleOptions: {wasmBinary}});
try {
  const sampleRate = chip.sampleRate();
  const segments = [];
  // writeRegister(address, value, port): channel 0, port 0.
  for (const address of [0x40, 0x44, 0x48]) chip.writeRegister(address, 127, 0);
  chip.writeRegister(0x3c, 1, 0);    // OP4: multiplier 1
  chip.writeRegister(0x4c, 8, 0);    // OP4: total level
  chip.writeRegister(0x5c, 31, 0);   // attack
  chip.writeRegister(0x6c, 0, 0);    // decay
  chip.writeRegister(0x7c, 0, 0);    // sustain rate
  chip.writeRegister(0x8c, 15, 0);   // release
  chip.writeRegister(0xb0, 7, 0);    // algorithm 7
  chip.writeRegister(0xb4, 0xc0, 0); // left + right
  chip.writeRegister(0xa4, (4 << 3) | (553 >> 8), 0);
  chip.writeRegister(0xa0, 553 & 0xff, 0);
  chip.writeRegister(0x28, 0xf0, 0);  // key on
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
  chip.writeRegister(0x28, 0x00, 0);  // key off
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
  const wav = encodeWav({left, right, sampleRate});
  const defaultPath = fileURLToPath(new URL('../../../../output/chip-raw-01-register-note.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

// Stereo PCM16 WAV, usable in browsers and Node. Reduce volume for playback.
function encodeWav({left, right, sampleRate}, gain = 0.25) {
  const dataSize = left.length * 4;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const text = (offset, value) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, dataSize, true);
  for (let i = 0; i < left.length; i++) {
    for (const [channel, samples] of [left, right].entries()) {
      const value = Math.max(-1, Math.min(1, samples[i] * gain));
      view.setInt16(44 + i * 4 + channel * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
    }
  }
  return new Uint8Array(buffer);
}

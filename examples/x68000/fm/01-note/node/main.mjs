// Run this file from the repository root with Node.js 22+.
import {createSoundChip} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/ym2151_wasm.wasm'));
const chip = await createSoundChip('ym2151', {moduleOptions: {wasmBinary}});
try {
  // X68000 uses a 4 MHz YM2151. Register writes below select channel 0.
  const sampleRate = chip.sampleRate(4000000);
  const segments = [];
  chip.reset();
  chip.write(0, 0x20);
  chip.write(1, 0xc7); // Both outputs, algorithm 7, feedback 0.
  for (let operator = 0; operator < 4; operator++) {
    const offset = operator * 8;
    chip.write(0, 0x40 + offset);
    chip.write(1, 1); // Multiplier 1, detune 0.
    chip.write(0, 0x60 + offset);
    chip.write(1, operator === 3 ? 24 : 127);
    chip.write(0, 0x80 + offset);
    chip.write(1, 31); // Attack.
    chip.write(0, 0xa0 + offset);
    chip.write(1, 0);  // First decay.
    chip.write(0, 0xc0 + offset);
    chip.write(1, 0);  // Second decay / detune 2.
    chip.write(0, 0xe0 + offset);
    chip.write(1, 15); // Sustain level 0, release 15.
  }
  chip.write(0, 0x28);
  chip.write(1, 0x4a); // Key code: octave and semitone bits.
  chip.write(0, 0x30);
  chip.write(1, 0);    // Key fraction 0.
  chip.write(0, 0x08);
  chip.write(1, 0x40); // Key on C2 (operator 3), channel 0.
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
  chip.write(0, 0x08);
  chip.write(1, 0);    // Key off channel 0.
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
  const defaultPath = fileURLToPath(new URL('../../../../../output/x68000-fm-01-note.wav', import.meta.url));
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

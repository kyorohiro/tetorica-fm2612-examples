// Run this file from the repository root with Node.js 22+.
import {Oki6258AudioEngine} from 'tetorica-fm2612/okim6258audioengine.js';
import moduleFactory from 'tetorica-fm2612/generated/okim6258_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/okim6258_wasm.wasm'));
const chip = await Oki6258AudioEngine.create({
  moduleFactory: () => moduleFactory({wasmBinary}),
  clock: 4000000, flags: 6, outputSampleRate: 44100,
});
try {
  const sampleRate = chip.sampleRate();
  const clock = 4000000;
  const divider = 512;
  const segments = [];
  // Original synthetic 4-bit ADPCM: positive and negative small steps.
  // Bytes decode low nibble first. This repeating pattern makes a triangle.
  const bytes = Uint8Array.from({length: 2344}, (_, i) => i % 16 < 8 ? 0x11 : 0x99);
  chip.reset();
  chip.writeOki6258(2, 0); // Enable both output channels.
  chip.writeOki6258(0, 2); // Start playback before writing data.
  let renderedFrames = 0;
  for (let i = 0; i < bytes.length; i++) {
    chip.writeOki6258(1, bytes[i]);
    // Each byte contains two nibbles. Advance audio before feeding the next
    // byte; use cumulative rounding so fractional sample timing is retained.
    const endFrame = Math.round((i + 1) * 2 * divider * sampleRate / clock);
    segments.push(chip.processFrames(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }
  chip.writeOki6258(0, 1); // Stop playback.
  segments.push(chip.processFrames(Math.round(sampleRate * 0.2)));
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
  const defaultPath = fileURLToPath(new URL('../../../../../output/x68000-adpcm-01-byte-stream.wav', import.meta.url));
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

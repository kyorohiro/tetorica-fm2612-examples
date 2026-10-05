// Run this file from the repository root with Node.js 22+.
import {createSoundChip} from 'tetorica-fm2612';
import {YM2608Synth, YM2608DirectTransport} from 'tetorica-fm2612/ym2608synth.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Read the WASM shipped in the installed npm package.
const wasmBinary = await readFile(runtimeAssetUrl('generated/ym2608_wasm.wasm'));
const chip = await createSoundChip('ym2608', {moduleOptions: {wasmBinary}});
try {
  const chipSampleRate = chip.sampleRate();
  const transport = new YM2608DirectTransport(chip);
  const fm = new YM2608Synth({transport});
  const segments = [];
  fm.ssg.tone(0, {frequency: 440, volume: 10});
  segments.push(chip.generateStereo(Math.round(chipSampleRate * 0.6)));
  fm.ssg.off(0);
  segments.push(chip.generateStereo(Math.round(chipSampleRate * 0.2)));
  // Concatenate the generated segments in their original order.
  const frames = segments.reduce((sum, segment) => sum + segment.left.length, 0);
  const nativeLeft = new Float32Array(frames);
  const nativeRight = new Float32Array(frames);
  let offset = 0;
  for (const segment of segments) {
    nativeLeft.set(segment.left, offset);
    nativeRight.set(segment.right, offset);
    offset += segment.left.length;
  }

  // YM2608's native rate is too high for a browser AudioBuffer.
  // Convert the PCM to 44.1 kHz with linear interpolation in this example.
  const sampleRate = 44100;
  const outputFrames = Math.round(frames * sampleRate / chipSampleRate);
  const left = new Float32Array(outputFrames);
  const right = new Float32Array(outputFrames);
  for (let i = 0; i < outputFrames; i++) {
    const position = i * chipSampleRate / sampleRate;
    const first = Math.min(Math.floor(position), frames - 1);
    const second = Math.min(first + 1, frames - 1);
    const fraction = position - first;
    left[i] = nativeLeft[first] * (1 - fraction) + nativeLeft[second] * fraction;
    right[i] = nativeRight[first] * (1 - fraction) + nativeRight[second] * fraction;
  }

  // Encode and save stereo PCM16. No audio driver is required.
  const wav = encodeWav({left, right, sampleRate});
  const defaultPath = fileURLToPath(new URL('../../../../../output/pc98-ssg-01-tone.wav', import.meta.url));
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

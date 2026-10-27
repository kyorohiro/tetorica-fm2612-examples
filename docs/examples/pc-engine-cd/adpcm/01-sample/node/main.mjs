// Node.js 22+: encode original PCM into 64 KiB ADPCM RAM; no audio device.
import {encodeWav} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/assets';
import {createMSM5205PCM} from 'tetorica-fm2612/msm5205_pcm.js';
import {prepareMSM5205Sample} from 'tetorica-fm2612/msm5205_sample.js';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SOURCE_RATE = 8000, OUTPUT_RATE = 48000, OUTPUT_GAIN = 0.5;
const mono = new Float32Array(Math.round(0.6 * SOURCE_RATE));
for (let i = 0; i < mono.length; ++i) {
  const fade = Math.min(1, i / (0.025 * SOURCE_RATE), (mono.length - 1 - i) / (0.025 * SOURCE_RATE));
  mono[i] = Math.sin(2 * Math.PI * 220 * i / SOURCE_RATE) * 0.20 * fade;
}
const prepared = await prepareMSM5205Sample({sampleRate: SOURCE_RATE, channels: [mono]}, {rate: 12});
const wasmBinary = await readFile(runtimeAssetUrl('generated/msm5205_wasm.wasm'));
const pcm = await createMSM5205PCM({sampleRate: OUTPUT_RATE, wasmBinary});
try {
  const chunks = [];
  const render = seconds => {
    const frames = Math.round(seconds * OUTPUT_RATE), left = new Float32Array(frames), right = new Float32Array(frames);
    pcm.render(left, right); chunks.push({left, right});
  };
  pcm.prepare(prepared.data);
  console.log(`Original 220 Hz · ${prepared.frames} nibbles / ${prepared.data.length} bytes · rate 12 = 8,000 Hz`);
  console.log('PHASE_ADPCM_PLAY 0.0–0.6 s');
  pcm.play({length: prepared.frames, rate: prepared.rate}); render(0.6);
  if (pcm.readState().state !== 'ended') throw new Error('Single-run sample did not reach EOF');
  console.log('PHASE_ADPCM_EOF 0.6–0.8 s'); render(0.2);
  console.log('PHASE_ADPCM_RANGE_LOOP offset 1, length 4798 nibbles · 0.8–1.6 s');
  // Keep both fades when demonstrating an odd nibble start. An arbitrary
  // middle slice can click or change level because loops retain predictor state.
  pcm.play({offset: 1, length: prepared.frames - 2, loop: true, rate: prepared.rate}); render(0.8);
  console.log('PHASE_ADPCM_STOP 1.6–1.8 s'); pcm.stop(); render(0.2);
  console.log('PHASE_ADPCM_REPLAY 1.8–2.4 s');
  pcm.play({length: prepared.frames, rate: prepared.rate}); render(0.6);
  console.log('PHASE_ADPCM_EOF 2.4–2.6 s'); render(0.2);

  const frames = chunks.reduce((sum, chunk) => sum + chunk.left.length, 0);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  const output = process.argv[2] ? resolve(process.argv[2])
    : fileURLToPath(new URL('../../../../../output/pc-engine-cd-adpcm-01-sample.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate: OUTPUT_RATE}, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${frames} frames · 48,000 Hz stereo PCM16 (duplicated mono) · output gain ${OUTPUT_GAIN} once`);
} finally {pcm.dispose();}

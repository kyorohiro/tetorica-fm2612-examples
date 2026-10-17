// Node.js 22+: offline SPC rendering. No audio device or optional audify required.
import {SpcCore} from 'tetorica-fm2612/spc.js';
import createSpcModule from 'tetorica-fm2612/generated/spc_wasm.js';
import {encodeWav} from 'tetorica-fm2612';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../output/snes-02-spc-player.wav', import.meta.url));
const input = process.argv[3] ? resolve(process.argv[3])
  : new URL('../assets/original.spc', import.meta.url);
const seconds = process.argv[4] === undefined ? 2 : Number(process.argv[4]);
if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 600) {
  throw new RangeError('Duration must be greater than 0 and no more than 600 seconds');
}
const wasmBinary = await readFile(new URL(import.meta.resolve('tetorica-fm2612/generated/spc_wasm.wasm')));
const core = await SpcCore.create({moduleFactory: createSpcModule, moduleOptions: {wasmBinary}});
try {
  core.load(await readFile(input));
  // The emulated SPC700 and S-DSP always run at native 32,000 stereo frames/s.
  const frames = Math.ceil(seconds * core.sampleRate);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  core.renderInto(left, right);
  if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Non-finite PCM');
  const wav = encodeWav({left, right, sampleRate: core.sampleRate});
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${frames} frames · ${core.sampleRate} Hz · stereo PCM16 · experimental SPC`);
} finally {
  core.dispose();
}

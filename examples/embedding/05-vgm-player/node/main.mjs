import {createGenesisAudioEngine} from 'tetorica-fm2612/genesisaudioengine.js';
import {VgmPlayer} from 'tetorica-fm2612/vgmplayer.js';
import ymFactory from 'tetorica-fm2612/generated/ym2612_wasm.js';
import psgFactory from 'tetorica-fm2612/generated/segapsg_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const engine = await createGenesisAudioEngine({
  ym2612ModuleFactory: ymFactory,
  segaPsgModuleFactory: psgFactory,
  ym2612ModuleOptions: {wasmBinary: await readFile(runtimeAssetUrl('generated/ym2612_wasm.wasm'))},
  segaPsgModuleOptions: {wasmBinary: await readFile(runtimeAssetUrl('generated/segapsg_wasm.wasm'))},
});
try {
  // A self-contained VGM 1.50: Sega PSG channel 0, about 440 Hz, one second.
  const commands = new Uint8Array([0x50, 0x8e, 0x50, 0x0f, 0x50, 0x90,
    0x61, 0x44, 0xac, 0x50, 0x9f, 0x66]);
  const bytes = new Uint8Array(0x100 + commands.length);
  const view = new DataView(bytes.buffer);
  bytes.set([0x56, 0x67, 0x6d, 0x20]); // "Vgm "
  view.setUint32(0x04, bytes.length - 4, true);
  view.setUint32(0x08, 0x150, true);
  view.setUint32(0x0c, 3579545, true); // PSG clock
  view.setUint32(0x18, 44100, true); // VGM timeline samples
  view.setUint32(0x2c, 7670454, true); // YM2612 clock
  view.setUint32(0x34, 0x100 - 0x34, true); // command data offset
  bytes.set(commands, 0x100);
  // Optional: node main.mjs input.vgm output.wav
  const input = process.argv[2] ? await readFile(resolve(process.argv[2])) : bytes;
  const player = new VgmPlayer(engine);
  player.load(input);
  player.setLoopEnabled(false);
  player.play();
  const segments = [];
  // Bound an example's output to 60 seconds even for long user-provided tracks.
  const sampleRate = engine.sampleRate();
  let frames = 0;
  while (player.isPlaying() || player.stats().queuedFrames > 0) {
    const left = new Float32Array(4096);
    const right = new Float32Array(4096);
    const count = player.process(left, right, 4096);
    if (count) { segments.push({left: left.slice(0, count), right: right.slice(0, count)}); frames += count; }
    if (frames >= sampleRate * 60) break;
  }
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let offset = 0;
  for (const segment of segments) {
    left.set(segment.left, offset); right.set(segment.right, offset); offset += segment.left.length;
  }
  const output = process.argv[3] ? resolve(process.argv[3]) : fileURLToPath(new URL('../../../../output/embedding-05-vgm-player.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.25}));
  console.log(`${output}\n${frames} frames · ${sampleRate} Hz`);
} finally { engine.dispose(); }

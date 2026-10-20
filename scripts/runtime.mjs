import {cp, mkdir, readFile, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

export async function copyRuntime(destination) {
  const source = join(root, 'node_modules/tetorica-fm2612');
  const manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  const {version} = manifest;
  if (!manifest.exports?.['./node/transports']) {
    throw new Error('These basic examples require tetorica-fm2612 >= 0.2.6 with WorkletTransport / AudifyTransport. Run npm install to install the declared version.');
  }
  // DX7 examples need the complete 0.2.14 Runtime and its bundled engine.
  try {
    await readFile(join(source, 'playground_dx7_worklet.js'));
    await readFile(join(source, 'msfa_dx7/wasm/msfa.wasm'));
  } catch {
    throw new Error('The DX7 examples require tetorica-fm2612 >= 0.2.14. Run npm install to install the declared version.');
  }
  try {
    for (const file of ['snessynth.js', 'spc.js', 'spc_audio.js', 'playground_snes_worklet.js',
      'generated/spc_wasm.js', 'generated/spc_wasm.wasm', 'licenses/snes-spc/LICENSE',
      'sources/wasm/spc_wasm.cpp', 'sources/scripts/build_spc_wasm.sh']) {
      await readFile(join(source, file));
    }
  } catch {
    throw new Error('The experimental SNES/SPC examples require tetorica-fm2612 >= 0.2.20, including its WASM and LGPL source. Run npm install.');
  }
  try {
    for (const file of ['huc6280synth.js', 'huc6280synth.d.ts', 'huc6280audioengine.js',
      'playground_huc6280.js', 'playground_huc6280_audio.js', 'playground_huc6280_worklet.js',
      'generated/huc6280_wasm.js', 'generated/huc6280_wasm.wasm', 'licenses/mame-huc6280/LICENSE']) {
      await readFile(join(source, file));
    }
  } catch {
    throw new Error('The PC Engine examples require tetorica-fm2612 >= 0.2.21, including HuC6280 Synth, Worklet, WASM and license. Run npm install.');
  }
  const target = join(destination, 'vendor/tetorica-fm2612');
  await mkdir(join(destination, 'vendor'), {recursive: true});
  await rm(target, {recursive: true, force: true});
  await cp(source, target, {recursive: true});
  console.log(`Copied installed tetorica-fm2612 ${version} (including WASM, Worklets and licenses).`);
}

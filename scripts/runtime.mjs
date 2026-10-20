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
  try {
    for (const file of ['opl_synth.js','opl_synth.d.ts','chip_worklet_transport.js','soundchip_worklet.js','soundchip-output-worklet.js',
      ...['ym3526','ym3812','y8950','ymf262'].flatMap(chip=>[`${chip}synth.js`,`${chip}synth.d.ts`,`${chip}.js`,`generated/${chip}_wasm.js`,`generated/${chip}_wasm.wasm`])]) {
      await readFile(join(source, file));
    }
  } catch {
    throw new Error('The OPL examples require tetorica-fm2612 >= 0.2.22, including OPL Synth, Worklet transports and all four WASM engines. Run npm install.');
  }
  try {
    for (const file of ['ay8910synth.js', 'ay8910synth.d.ts', 'ym2413synth.js', 'ym2413synth.d.ts',
      'playground_ay8910.js', 'playground_ay8910_worklet.js', 'playground_ym2413.js', 'playground_ym2413_worklet.js',
      'msxaudioengine.js', 'generated/ay8910_wasm.js', 'generated/ay8910_wasm.wasm',
      'generated/ym2413_wasm.js', 'generated/ym2413_wasm.wasm',
      'licenses/mame-ay8910/LICENSE', 'THIRD_PARTY_LICENSES.txt']) {
      await readFile(join(source, file));
    }
  } catch {
    throw new Error('The AY / OPLL / MSX examples require tetorica-fm2612 >= 0.2.23, including Synths, composite modes, Worklets, WASM and licenses. Run npm install.');
  }
  const target = join(destination, 'vendor/tetorica-fm2612');
  await mkdir(join(destination, 'vendor'), {recursive: true});
  await rm(target, {recursive: true, force: true});
  await cp(source, target, {recursive: true});
  console.log(`Copied installed tetorica-fm2612 ${version} (including WASM, Worklets and licenses).`);
}

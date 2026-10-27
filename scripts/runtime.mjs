import {cp, mkdir, readFile, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

export async function copyRuntime(destination) {
  const source = join(root, 'node_modules/tetorica-fm2612');
  const manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  const {version} = manifest;
  try {
    const entry = await readFile(join(source, manifest.exports?.['.']?.import ?? 'soundchip.js'), 'utf8');
    if (!entry.includes('SOUNDCHIP_MIXER_PRESETS')) throw new Error('Missing preset export');
    await readFile(join(source, 'soundchip_mixer_presets.js'));
  } catch {
    throw new Error('The calibrated Mixer example requires tetorica-fm2612 >= 0.2.27 with SOUNDCHIP_MIXER_PRESETS. Run npm install to install the declared version.');
  }
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
  try {
    for (const file of ['wonderswan.js', 'wonderswansynth.js', 'wonderswanaudioengine.js',
      'generated/wonderswan_wasm.js', 'generated/wonderswan_wasm.wasm', 'licenses/mame-wonderswan/LICENSE']) {
      await readFile(join(source, file));
    }
    const transports = await readFile(join(source, 'chip_worklet_transport.js'), 'utf8');
    if (!transports.includes('WonderSwanWorkletTransport')) throw new Error('Missing WonderSwan Worklet transport');
  } catch {
    throw new Error('The WonderSwan examples require tetorica-fm2612 >= 0.2.30, including generic Worklet / Direct factories, Synth, WASM and license. Run npm install.');
  }
  try {
    // Check the published capabilities and rebuild inputs, rather than trusting
    // a version string or a core-only package with no speaker/Worklet payload.
    for (const file of ['pokey.js', 'pokey.d.ts', 'pokeysynth.js', 'pokeysynth.d.ts',
      'pokeyaudioengine.js', 'pokeyaudioengine.d.ts', 'generated/pokey_wasm.js',
      'generated/pokey_wasm.d.ts', 'licenses/libvgm-pokey/LICENSE', 'licenses/libvgm-pokey/README.md',
      'sources/POKEY.md', 'sources/POKEY-SDK.json', 'sources/wasm/pokey_wasm.cpp',
      'sources/scripts/build_pokey_wasm.sh', 'sources/third_party/libvgm-pokey/pokey.cpp',
      'sources/third_party/libvgm-pokey/pokey.h', 'sources/third_party/libvgm-pokey/LICENSE',
      'sources/third_party/libvgm-pokey/README.md', 'sources/third_party/libvgm-pokey/upstream/pokey.c',
      'sources/third_party/libvgm-pokey/upstream/snapshot-manifest.json']) {
      await readFile(join(source, file));
    }
    const [entry, worklet, processor, wasm, api, synth, speaker, transports] = await Promise.all([
      readFile(join(source, 'soundchip.js'), 'utf8'),
      readFile(join(source, 'soundchip_worklet.js'), 'utf8'),
      readFile(join(source, 'soundchip-output-worklet.js'), 'utf8'),
      readFile(join(source, 'generated/pokey_wasm.wasm')),
      import('tetorica-fm2612'), import('tetorica-fm2612/pokeysynth.js'),
      import('tetorica-fm2612/pokeyaudioengine.js'), import('tetorica-fm2612/chip_worklet_transport.js'),
    ]);
    if (typeof api.createSoundChip !== 'function' || !/pokey:\s*async/.test(entry) ||
        !worklet.includes("'pokey'") || !/pokey:\s*\[\s*Pokey\s*,\s*pokeyFactory\s*\]/.test(processor) ||
        !processor.includes('PokeyAudioEngine') ||
        typeof synth.PokeySynth !== 'function' || typeof synth.PokeyDirectTransport !== 'function' ||
        typeof speaker.PokeyAudioEngine !== 'function' || typeof transports.PokeyWorkletTransport !== 'function' ||
        wasm.subarray(0, 8).toString('hex') !== '0061736d01000000') {
      throw new Error('Missing POKEY factory, transport, speaker engine or WASM capability');
    }
  } catch {
    throw new Error('The POKEY examples require tetorica-fm2612 >= 0.2.31, including exported speaker engine, Direct / Worklet factories and transports, Synth, WASM, BSD licenses and corresponding source. Run npm install.');
  }
  try {
    for (const file of ['cdda_audio.js', 'cdda_player.js', 'cdda_offline.js', 'cdda_offline.d.ts',
      'cdda_worklet.js', 'generated/cdda_wasm.js', 'generated/cdda_wasm.wasm',
      'msm5205_audio.js', 'msm5205_player.js', 'msm5205_sample.js', 'msm5205_pcm.js',
      'msm5205_worklet.js', 'generated/msm5205_wasm.js', 'generated/msm5205_wasm.wasm',
      'sources/native/cdda/LICENSE', 'sources/native/cdda/cdda_pcm.c',
      'sources/native/msm5205/LICENSE', 'sources/native/msm5205/NOTICE.md',
      'sources/native/msm5205/msm5205_pcm.c']) await readFile(join(source, file));
    const [cdda, msm5205, sample] = await Promise.all([
      import('tetorica-fm2612/cdda_offline.js'), import('tetorica-fm2612/msm5205_pcm.js'),
      import('tetorica-fm2612/msm5205_sample.js'),
    ]);
    if (typeof cdda.createCddaOffline !== 'function' || typeof msm5205.createMSM5205PCM !== 'function' ||
        typeof sample.prepareMSM5205Sample !== 'function') throw new Error('Missing CD audio APIs');
  } catch {
    throw new Error('The CD-ROM² examples require tetorica-fm2612 >= 0.2.32 with CD-DA / MSM5205 APIs, Worklets, WASM, sources and notices. Run npm install.');
  }
  const target = join(destination, 'vendor/tetorica-fm2612');
  await mkdir(join(destination, 'vendor'), {recursive: true});
  await rm(target, {recursive: true, force: true});
  await cp(source, target, {recursive: true});
  console.log(`Copied installed tetorica-fm2612 ${version} (including WASM, Worklets and licenses).`);
}

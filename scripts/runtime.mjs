import {cp, mkdir, readFile, rm} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

// Validate only the installed npm payload. Keep its authored modules, types,
// source receipts and npm-safe source metadata aliases unchanged when copying.
// In particular, do not restore/repack .gitignore or Cargo.toml.orig here:
// npmStorage describes their original bytes and the explicit rebuild recipe.
export async function verifySidRuntime(source=join(root,'node_modules/tetorica-fm2612')) {
  const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
  const safe=name=>{
    assert(typeof name==='string'&&name&&!/[\\:\x00-\x1f\x7f]/.test(name)
      &&name.split('/').every(part=>part&&part!=='.'&&part!=='..'),'Unsafe SID source receipt path');
    return name;
  };
  const record=async(name,expected)=>{
    safe(name);assert(expected&&Number.isSafeInteger(expected.bytes)&&expected.bytes>=0
      &&typeof expected.sha256==='string'&&/^[a-f0-9]{64}$/.test(expected.sha256),'Invalid SID source receipt');
    const bytes=await readFile(join(source,name));
    assert.equal(bytes.length,expected.bytes,'SID source bytes differ: '+name);
    assert.equal(sha(bytes),expected.sha256,'SID source hash differs: '+name);return bytes;
  };
  for(const name of ['sid.js','sid.d.ts','sid8580.js','sid8580.d.ts','sidsynth.js','sidsynth.d.ts','sid_soundchip.js','sid_soundchip.d.ts',
    'sid_waveforms.js','sid_waveforms.d.ts','playground_sid.js','playground_sid.d.ts',
    'playground_sid_audio.js','playground_sid_audio.d.ts','playground_sid_worklet.js',
    'playground_sid_worklet.d.ts','playground_sid_inspector.js','playground_sid_inspector.d.ts',
    'playground_runtime.js','playground_logic_worker.js','sources/SID.md','sources/SID8580.md',
    'sources/sid/README.md','sources/sid/tetorica_src/runtime/sid.d.ts',
    'licenses/chips-m6581/LICENSE','licenses/chips-m6581/README.md','licenses/chips-m6581/PATCHES.md'])
    await readFile(join(source,name));
  const [core,preview,synth,waves]=await Promise.all([
    import('tetorica-fm2612/sid.js'),import('tetorica-fm2612/sid8580.js'),
    import('tetorica-fm2612/sidsynth.js'),import('tetorica-fm2612/sid_waveforms.js'),
  ]);
  assert.equal(typeof core.SidCore?.create,'function');assert.equal(typeof preview.Sid8580Core?.create,'function');
  assert.equal(typeof synth.SidSynth,'function');assert.equal(typeof synth.SidDirectTransport,'function');
  for(let mask=0;mask<16;mask++)assert.equal(waves.sidWaveformBits(waves.sidWaveformFromBits(mask)),mask);

  const receipt6581=JSON.parse(await readFile(join(source,'generated/sid/sid-build.json'),'utf8'));
  assert.equal(receipt6581.component,'sid-lab');assert.equal(receipt6581.model,'6581');
  assert.equal(receipt6581.fixedSdkArtifact,false);assert.equal(Object.keys(receipt6581.inputs).length,13);
  for(const[name,expected]of Object.entries(receipt6581.inputs))await record('sources/sid/'+safe(name),expected);
  const wasm6581=await record('generated/sid/sid.wasm',receipt6581.output);
  assert.equal(wasm6581.subarray(0,8).toString('hex'),'0061736d01000000');
  for(const name of ['LICENSE','README.md','PATCHES.md'])assert.deepEqual(
    await readFile(join(source,'licenses/chips-m6581',name)),
    await readFile(join(source,'sources/sid/third_party/chips-m6581',name)),
    'SID license notice differs from native source: '+name);

  const kitRoot='sources/sid8580-machine';
  const kit=JSON.parse(await readFile(join(source,kitRoot,'source-kit.json'),'utf8'));
  assert.equal(kit.format,'tetorica-sid-player-8580-source-kit');assert.equal(kit.model,'8580');
  assert.equal(kit.preview,true);assert.equal(kit.compiledInputCount,99);
  assert.equal(Object.keys(kit.compiledInputs).length,99);assert.equal(kit.compilerInvocationPerformed,false);
  assert(kit.sources&&typeof kit.sources==='object'&&!Array.isArray(kit.sources));
  const storage=kit.npmStorage;assert.equal(storage?.version,1);
  assert(storage.aliases&&typeof storage.aliases==='object'&&!Array.isArray(storage.aliases));
  const aliases=new Map(Object.entries(storage.aliases)),destinations=new Set();
  for(const[name,stored]of aliases){
    safe(name);safe(stored);assert(Object.hasOwn(kit.sources,name),'SID alias must retain an original source record');
    assert(!destinations.has(stored)&&!Object.hasOwn(kit.sources,stored),'SID source aliases must not collide');
    destinations.add(stored);
  }
  for(const name of ['third_party/sidera/upstream/.gitignore','third_party/sidera/upstream/Cargo.toml.orig'])
    assert(aliases.has(name),'Missing npm-safe SID source alias: '+name);
  for(const[name,expected]of Object.entries(kit.sources)){
    safe(name);await record(kitRoot+'/'+(aliases.get(name)??name),expected);
    // If a user explicitly restored a canonical name, it must still match.
    if(aliases.has(name)){
      let canonical;
      try{canonical=await readFile(join(source,kitRoot,name));}catch(error){if(error.code!=='ENOENT')throw error;}
      if(canonical){assert.equal(canonical.length,expected.bytes);assert.equal(sha(canonical),expected.sha256);}
    }
  }
  for(const[name,expected]of Object.entries(kit.compiledInputs))assert.deepEqual(kit.sources[name],expected,
    'SID compiled input missing from readable source kit: '+name);
  assert.equal(storage.restore?.path,'restore-npm-sources.mjs');
  await record(kitRoot+'/'+storage.restore.path,storage.restore);
  const receiptBytes=await record(kitRoot+'/'+safe(kit.buildReceipt.path),kit.buildReceipt);
  assert.deepEqual(receiptBytes,await readFile(join(source,'generated/sid8580-machine/sid8580-machine-build.json')));
  const receipt8580=JSON.parse(receiptBytes);
  assert.equal(receipt8580.fixedSdkArtifact,false);assert.deepEqual(receipt8580.inputs,kit.compiledInputs);
  const outputs=new Set();
  for(const artifact of kit.artifacts){safe(artifact.path);await record(artifact.path,artifact);outputs.add(artifact.path);}
  for(const name of ['sid8580-endpoint.wasm','sid8580-machine.wasm']){
    const output='generated/sid8580-machine/'+name;assert(outputs.has(output),'Missing 8580 artifact '+name);
    const bytes=await record(output,receipt8580.outputs[name]);assert.equal(bytes.subarray(0,8).toString('hex'),'0061736d01000000');
  }
  for(const name of ['third_party/sidera/toolchain-notices','third_party/sid8580-machine-toolchain-notices']){
    assert(kit.noticeRoots.includes(name),'Missing SID toolchain notice root');
    assert(kit.sources[name+'/README.md']&&kit.sources[name+'/SOURCES.json'],'Missing SID toolchain notice manifest');
    const notices=JSON.parse(await record(kitRoot+'/'+name+'/SOURCES.json',kit.sources[name+'/SOURCES.json']));
    assert(notices.files&&Object.keys(notices.files).length,'Empty SID toolchain notice manifest');
    for(const[file,expected]of Object.entries(notices.files)){
      const sourceName=name+'/'+safe(file),retained=kit.sources[sourceName];
      assert(retained,'Missing SID toolchain license: '+sourceName);
      assert.equal(retained.bytes,expected.bytes);assert.equal(retained.sha256,expected.sha256);
    }
  }
  return {models:['6581','8580'],nativeInputs6581:13,compiledInputs8580:99,readableSources8580:Object.keys(kit.sources).length,metadataAliases:aliases.size};
}

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
  try {
    await verifySidRuntime(source);
  } catch(error) {
    throw new Error('The SID examples require the complete tetorica-fm2612 >= 0.2.39 payload: common factory, both cores, Synth, typed clients, Worklets, WASM, matching sources, npm-safe metadata aliases and notices. Run npm install.',{cause:error});
  }
  const target = join(destination, 'vendor/tetorica-fm2612');
  await mkdir(join(destination, 'vendor'), {recursive: true});
  await rm(target, {recursive: true, force: true});
  await cp(source, target, {recursive: true});
  console.log(`Copied installed tetorica-fm2612 ${version} (including WASM, Worklets and licenses).`);
}

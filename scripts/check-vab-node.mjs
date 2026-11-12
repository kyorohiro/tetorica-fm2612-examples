// Published-package consumer checks. CPU-only PCM/WAV; never an audio device.
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {copyFile,link,mkdir,mkdtemp,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readVab,prepareVabTone,exportVab} from 'tetorica-fm2612';
import {Ps1Spu} from 'tetorica-fm2612/ps1_spu.js';
import {Ps1Synth} from 'tetorica-fm2612/ps1synth.js';
import factory from 'tetorica-fm2612/generated/ps1_spu_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/assets';

if(process.argv.length>3)throw new Error('Usage: node scripts/check-vab-node.mjs [report.json]');
const root=fileURLToPath(new URL('../',import.meta.url));
const entry=join(root,'examples/ps1/spu/03-vab-bank/node/main.mjs');
const sourcePath=join(root,'examples/ps1/spu/03-vab-bank/assets/demo.vab');
const source=await readFile(sourcePath),bank=readVab(source);
const wasmBinary=await readFile(runtimeAssetUrl('generated/ps1_spu_wasm.wasm'));
const directory=await mkdtemp(join(tmpdir(),'tetorica-vab-node-'));
const report={passed:false,package:'tetorica-fm2612@0.2.40',cases:[],rejected:[],audioDeviceUsed:false};
assert.equal(typeof globalThis.AudioContext,'undefined');

function checkWav(wav) {
  const frames=114660,tail=8820;
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);
  assert.equal(wav.readUInt32LE(24),44100);assert.equal(wav.readUInt16LE(34),16);
  assert.equal(wav.readUInt32LE(4),wav.length-8);assert.equal(wav.readUInt32LE(40),frames*4);
  assert.equal(wav.length,44+frames*4);
  let peak=0,nonzero=0;
  for(let at=44;at<wav.length;at+=2) {
    const value=wav.readInt16LE(at)/32768;
    assert(Number.isFinite(value)&&Math.abs(value)<0.95,'finite, unclipped PCM');
    peak=Math.max(peak,Math.abs(value));if(value!==0)nonzero++;
  }
  assert(peak>.001&&nonzero>16,'a real instrument, not an empty output');
  assert(wav.subarray(-tail*4).every(byte=>byte===0),'Stop clears the complete final 0.2 seconds');
  return {frames,peak,nonzero,stopSilentFrames:tail};
}
async function renderFirstNote(prepared) {
  const synth=new Ps1Synth({core:await Ps1Spu.create({moduleFactory:factory,moduleOptions:{wasmBinary}})});
  try {
    const instrument=synth.loadADPCM(prepared.adpcm,prepared.options);
    synth.setPreset(0,{...prepared.preset,sample:instrument});synth.setReverb({preset:'off'});
    assert.deepEqual(synth.core.readRam(instrument.startAddress,prepared.adpcm.length),prepared.adpcm);
    assert.deepEqual(synth.getPreset(0),{sample:instrument.id,...prepared.preset});
    synth.noteOn(0,'C4');
    const left=new Float32Array(4096),right=new Float32Array(4096);
    synth.renderInto(left,right);
    return {left,right,pitch:synth.getPreset(0).pitch};
  }finally{synth.dispose();}
}
async function absent(path) {
  assert.equal(await stat(path).then(()=>true,error=>{if(error.code==='ENOENT')return false;throw error;}),false,`Unexpected output ${path}`);
}
try {
  for(const [index,program,tone] of [[0,3,0],[1,3,1],[2,11,0]]) {
    const output=join(directory,`tone-${index}.wav`),exported=join(directory,`tone-${index}.vab`);
    const args=index===0?[output,'--export-vab',exported]:[output,'--program',String(program),'--tone',String(tone),'--export-vab',exported];
    const metadata=JSON.parse(execFileSync(process.execPath,[entry,...args],{cwd:root,encoding:'utf8',timeout:30000}));
    const expected=prepareVabTone(bank,index),measure=checkWav(await readFile(output));
    assert.equal(metadata.program,program);assert.equal(metadata.tone,tone);
    assert.equal(metadata.baseFrequencyHz,expected.options.baseFrequencyHz);
    assert.equal(metadata.loopStartSamples,expected.options.loopStartSamples??null);
    assert.equal(metadata.trimmedBytes,16);assert.equal(metadata.adpcmBytes,expected.adpcm.length);
    assert.deepEqual(metadata.preset,expected.preset,'source ADSR/level/pan/send retained');
    assert.equal(metadata.frames,measure.frames);assert.equal(metadata.stopTailFrames,measure.stopSilentFrames);
    const pitches=[60,64,67,72].map(midi=>Math.round(4096*(440*2**((midi-69)/12))/expected.options.baseFrequencyHz));
    assert.deepEqual(metadata.pitches,pitches,'declared center/fine tuning controls raw PITCH');
    const singleBytes=await readFile(exported),single=readVab(singleBytes),preparedAgain=prepareVabTone(single,0);
    assert.deepEqual(singleBytes,Buffer.from(exportVab(bank,{toneNumber:index})));
    assert.equal(single.programs[0].index,program);assert.equal(single.tones.length,1);
    assert.deepEqual(single.tones[0],{...bank.tones[index],index:0,sample:1});
    assert.deepEqual(single.samples[0].bytes,bank.samples[expected.tone.sample-1].bytes,'raw post-END padding retained');
    assert.deepEqual(preparedAgain.adpcm,expected.adpcm);assert.deepEqual(preparedAgain.options,expected.options);
    assert.deepEqual(preparedAgain.preset,expected.preset);
    const before=await renderFirstNote(expected),after=await renderFirstNote(preparedAgain);
    assert.deepEqual(after,before,'reopened standard VAB renders sample-exact PCM with identical tuning');
    report.cases.push({program,tone,...measure,baseFrequencyHz:metadata.baseFrequencyHz,pitches,
      exportedBytes:singleBytes.length,samplePaddingPreserved:true,pcmRoundTripExact:true});
  }

  // Rejected selections/bytes must not create either output file.
  const bad=join(directory,'bad.vab'),noise=join(directory,'noise.vab');
  await writeFile(bad,new Uint8Array(32));
  const noiseBytes=Buffer.from(source);noiseBytes.writeUInt16LE(255,0x820+22);await writeFile(noise,noiseBytes);
  const failures=[['bad arguments',['--unknown']],['out-of-range Program',['--program','128']],
    ['absent Tone',['--program','11','--tone','1']],['bad VAB',['--input',bad]],['Noise Tone',['--input',noise]]];
  for(const [index,[name,args]] of failures.entries()) {
    const wav=join(directory,`rejected-${index}.wav`),vab=join(directory,`rejected-${index}.vab`);
    const result=spawnSync(process.execPath,[entry,wav,...args,'--export-vab',vab],{cwd:root,encoding:'utf8',timeout:30000});
    assert.notEqual(result.status,0,`${name} must fail`);assert.equal(result.error,undefined);
    await absent(wav);await absent(vab);report.rejected.push(name);
  }
  const privateInput=join(directory,'source.vab'),alias=join(directory,'source-hardlink.vab');
  await copyFile(sourcePath,privateInput);await link(privateInput,alias);
  for(const args of [[privateInput,'--input',privateInput],[alias,'--input',privateInput],
    [join(directory,'must-not-write.wav'),'--input',privateInput,'--export-vab',privateInput]]) {
    const result=spawnSync(process.execPath,[entry,...args],{cwd:root,encoding:'utf8',timeout:30000});
    assert.notEqual(result.status,0,'input clobber must fail');assert.match(result.stderr,/different files/);
    assert.deepEqual(await readFile(privateInput),source);
  }
  await absent(join(directory,'must-not-write.wav'));
  assert.deepEqual(await readFile(sourcePath),source,'bundled original bank is immutable');
  report.inputClobberPrevented=true;report.passed=true;
  if(process.argv[2]){await mkdir(dirname(process.argv[2]),{recursive:true});await writeFile(process.argv[2],JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report,null,2));
}finally{await rm(directory,{recursive:true,force:true});}

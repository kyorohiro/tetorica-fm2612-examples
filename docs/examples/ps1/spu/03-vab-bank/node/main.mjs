// Standard VAB -> tuned SPU instrument -> offline WAV. No audio device.
import {readVab, prepareVabTone, exportVab, encodeWav} from 'tetorica-fm2612';
import {Ps1Spu} from 'tetorica-fm2612/ps1_spu.js';
import {Ps1Synth} from 'tetorica-fm2612/ps1synth.js';
import factory from 'tetorica-fm2612/generated/ps1_spu_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/assets';
import {readFile, mkdir, stat, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const usage='Usage: node main.mjs [output.wav] [--input bank.vab] [--program 0..127] [--tone 0..15] [--export-vab output.vab]';
const options={};
let outputPath;
const args=process.argv.slice(2);
while(args.length) {
  const arg=args.shift();
  if(!arg)throw new Error(usage);
  if(!arg.startsWith('--')) {
    if(outputPath)throw new Error(usage);
    outputPath=arg;continue;
  }
  const [flag,inline]=arg.split(/=(.*)/s),name=flag.slice(2);
  if(!['input','program','tone','export-vab'].includes(name)||name in options)throw new Error(usage);
  const value=inline??args.shift();
  if(!value||value.startsWith('--'))throw new Error(usage);
  options[name]=value;
}
function numberOption(name,maximum) {
  const value=options[name];
  if(value===undefined)return null;
  if(!/^\d+$/.test(value)||Number(value)>maximum)throw new RangeError(`${name} must be 0..${maximum}`);
  return Number(value);
}
const programOption=numberOption('program',127),toneIndex=numberOption('tone',15)??0;
const input=options.input?resolve(options.input):fileURLToPath(new URL('../assets/demo.vab',import.meta.url));
const output=outputPath?resolve(outputPath):fileURLToPath(new URL('../../../../../output/ps1-spu-03-vab-bank.wav',import.meta.url));
const exported=options['export-vab']?resolve(options['export-vab']):null;

// Validate the bank, selection and export before touching output files.
const bank=readVab(await readFile(input));
const program=programOption??bank.programs[0].index;
const toneNumber=bank.tones.findIndex(tone=>tone.program===program&&tone.index===toneIndex);
if(toneNumber<0)throw new RangeError(`Program ${program}, Tone ${toneIndex} is absent. Available: ${bank.tones.map(t=>`${t.program}:${t.index}`).join(', ')}`);
const prepared=prepareVabTone(bank,toneNumber);
const selectedVab=exported?exportVab(bank,{toneNumber}):null;

// Existing outputs are overwritten, but never the input (including hardlinks
// or symlinks) or another output of this invocation.
const paths=[input,output,...(exported?[exported]:[])],identities=[];
for(const path of paths) {
  const info=await stat(path).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(info&&!info.isFile())throw new Error(`Expected a file path: ${path}`);
  if(identities.some(previous=>previous.path===path||info&&previous.info&&info.dev===previous.info.dev&&info.ino===previous.info.ino)) {
    throw new Error('Input VAB, output WAV and exported VAB must be different files.');
  }
  identities.push({path,info});
}

const sampleRate=44100,stopTailFrames=8820;
const core=await Ps1Spu.create({moduleFactory:factory,moduleOptions:{
  wasmBinary:await readFile(runtimeAssetUrl('generated/ps1_spu_wasm.wasm')),
}});
const spu=new Ps1Synth({core});
try {
  const instrument=spu.loadADPCM(prepared.adpcm,prepared.options);
  spu.setPreset(0,{...prepared.preset,sample:instrument});
  // Keep source ADSR, levels and send. Shared reverb is a separate host choice.
  spu.setReverb({preset:'off'});
  const notes=['C4','E4','G4','C5'],heldFrames=19845,releaseFrames=6615;
  const frames=notes.length*(heldFrames+releaseFrames)+stopTailFrames;
  const left=new Float32Array(frames),right=new Float32Array(frames),pitches=[];
  let offset=0;
  for(const note of notes) {
    spu.noteOn(0,note);pitches.push(spu.getPreset(0).pitch);
    spu.renderInto(left,right,heldFrames,offset);offset+=heldFrames;
    spu.keyOff(0);
    spu.renderInto(left,right,releaseFrames,offset);offset+=releaseFrames;
  }
  spu.stopVoices(); // Clear voices/tails without rewriting the instrument.
  spu.renderInto(left,right,stopTailFrames,offset);
  let peak=0;
  for(const channel of [left,right])for(const value of channel) {
    if(!Number.isFinite(value))throw new Error('SPU returned non-finite PCM.');
    peak=Math.max(peak,Math.abs(value));
  }
  const wav=encodeWav({left,right,sampleRate}); // No normalization or gain change.
  await mkdir(dirname(output),{recursive:true});
  if(exported)await mkdir(dirname(exported),{recursive:true});
  await writeFile(output,wav);
  if(exported)await writeFile(exported,selectedVab);
  console.log(JSON.stringify({output,exportedVab:exported,program,tone:toneIndex,
    sourceSample:prepared.tone.sample,baseFrequencyHz:prepared.options.baseFrequencyHz,
    loopStartSamples:instrument.loopStartSamples,decodedFrames:instrument.decodedFrames,
    adpcmBytes:prepared.adpcm.length,trimmedBytes:prepared.trimmedBytes,
    preset:prepared.preset,pitches,sampleRate,frames,seconds:frames/sampleRate,stopTailFrames,peak},null,2));
}finally{spu.dispose();} // Ps1Synth owns this WASM core.

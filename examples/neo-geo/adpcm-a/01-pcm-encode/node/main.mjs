// Node.js 22+: original source, software preparation and real chip render. No audio device.
// encodeAdpcmA is a software encoder. YM2610B's actual ADPCM-A circuit decodes the bytes.
import {encodeAdpcmA} from 'tetorica-fm2612/adpcm_a_sample.js';
import {Ym2610BAudioEngine} from 'tetorica-fm2612/ym2610baudioengine.js';
import {YM2610BSynth,YM2610BDirectTransport} from 'tetorica-fm2612/ym2610bsynth.js';
import moduleFactory from 'tetorica-fm2612/generated/ym2610b_wasm.js';
export const wasmAsset='generated/ym2610b_wasm.wasm';
export async function renderExample({wasmBinary,signal}={}){
 signal?.throwIfAborted();const clock=8000000,decodedRate=clock/432,frequencyHz=440,sourceFrames=16384;
 const pcm=Float32Array.from({length:sourceFrames},(_,i)=>.45*Math.sin(2*Math.PI*frequencyHz*i/decodedRate)*Math.min(1,i/(.005*decodedRate),(sourceFrames-1-i)/(.005*decodedRate)));
 const encoded=encodeAdpcmA(pcm); // No resampling; input is already at clock/432.
 const sampleRate=48000,outputGain=.5,address=0x100;
 const engine=await Ym2610BAudioEngine.create({moduleFactory,moduleOptions:{wasmBinary},clock,outputSampleRate:sampleRate,masterVolume:outputGain});
 try{
  signal?.throwIfAborted();const synth=new YM2610BSynth({transport:new YM2610BDirectTransport(engine.chip),clock});
  const adpcmA=synth.adpcmA;
  adpcmA.loadMemory(encoded.bytes,address);
  adpcmA.setSample(0,{start:address,end:address+encoded.bytes.length}); // Exclusive end; both 256-byte aligned.
  adpcmA.setVolume(48);adpcmA.setVoice(0,{volume:31,left:true,right:true});adpcmA.keyOn(0);
  const {left,right}=engine.processFrames(52800); // 1.1 s; the encoded range ends without repeating.
  adpcmA.keyOff(0);signal?.throwIfAborted();
  const source=Float32Array.from(pcm,value=>value*outputGain);
  return {source:{channels:[source,source],sampleRate:decodedRate},chip:{channels:[left,right],sampleRate},
   plot:{source:pcm.subarray(1000,1128),converted:left.subarray(2600,2728)},
   metadata:{format:'PCM -> ADPCM-A -> real YM2610B',softwarePreparation:true,clock,decodedRate,sampleRate,frequencyHz,
    sourceFrames,encodedBytes:encoded.bytes.length,startAddress:address,endAddress:address+encoded.bytes.length,
    paddingFrames:encoded.paddingFrames,hardwarePitchControl:false,hardwareLoop:false,durationSeconds:left.length/sampleRate,
    outputGain,metrics:encoded.metrics}};
 }finally{engine.dispose();}
}

import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const result=await renderExample({wasmBinary:await readFile(runtimeAssetUrl(wasmAsset))});
const {channels,sampleRate}=result.chip,left=channels[0],right=channels[1];
assert.equal(typeof globalThis.AudioContext,'undefined');assert(left.every(Number.isFinite)&&right.every(Number.isFinite));
const first=Math.round(.12*sampleRate),last=Math.min(left.length,Math.round(.65*sampleRate)),crossings=[];
let sum=0,squares=0,peak=0;
for(let i=first;i<last;i++){const value=left[i];sum+=value;squares+=value*value;peak=Math.max(peak,Math.abs(value));if(i>first&&left[i-1]<=0&&value>0)crossings.push(i-1-left[i-1]/(value-left[i-1]));}
const count=last-first,mean=sum/count,acRms=Math.sqrt(Math.max(0,squares/count-mean*mean));
assert(peak<.99&&acRms>.001,'Finite, unclipped sustained AC audio');
const frequency=crossings.length>4?sampleRate*(crossings.length-1)/(crossings.at(-1)-crossings[0]):0;
assert(Math.abs(frequency-result.metadata.frequencyHz)<8,'Actual chip tone matches declared frequency');
const output=process.argv[2]?resolve(process.argv[2]):fileURLToPath(new URL('../../../../../output/neo-geo-adpcm-a-01-pcm-encode.wav',import.meta.url));
await mkdir(dirname(output),{recursive:true});await writeFile(output,encodeWav({left,right,sampleRate},{gain:1}));
console.log(output+'\n'+JSON.stringify({...result.metadata,frames:left.length,verifiedFrequencyHz:frequency,verifiedAcRms:acRms},null,2));

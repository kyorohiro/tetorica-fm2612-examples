// Node.js 22+: original source, software preparation and real chip render. No audio device.
// Software preparation: original Float32 PCM -> BRR. Then the real S-DSP renders it.
import {encodeBrr} from 'tetorica-fm2612/snes_brr_encoder.js';
import {SnesDspCore} from 'tetorica-fm2612/spc.js';
import {SnesSynth} from 'tetorica-fm2612/snessynth.js';
import moduleFactory from 'tetorica-fm2612/generated/spc_wasm.js';
export const wasmAsset='generated/spc_wasm.wasm';
export async function renderExample({wasmBinary,signal}={}){
 signal?.throwIfAborted();const sampleRate=32000,cycleFrames=64,frequencyHz=sampleRate/cycleFrames;
 const pcm=Float32Array.from({length:cycleFrames},(_,i)=>.45*Math.sin(2*Math.PI*i/cycleFrames)+.10*Math.sin(4*Math.PI*i/cycleFrames));
 const encoded=encodeBrr(pcm,{loopStartSamples:0}); // 64 and 0 are both aligned to 16 samples.
 const core=await SnesDspCore.create({moduleFactory,moduleOptions:{wasmBinary}});let snes;
 try{
  signal?.throwIfAborted();snes=new SnesSynth({core});
  const sample=snes.loadBRR(encoded.brr,{baseFrequencyHz:frequencyHz,loopStartSamples:0});
  snes.setPreset(0,{sample,pitch:4096,adsr1:0,adsr2:0,gain:127,volumeLeft:90,volumeRight:90});
  const left=new Float32Array(38400),right=new Float32Array(38400);
  snes.keyOn(0);snes.renderInto(left,right,32000); // Hardware loop, exactly one second.
  snes.keyOff(0);snes.renderInto(left,right,6400,32000);
  const outputGain=.4;for(const channel of [left,right])for(let i=0;i<channel.length;i++)channel[i]*=outputGain;
  const source=new Float32Array(left.length);for(let i=0;i<32000;i++)source[i]=pcm[i%cycleFrames]*outputGain*Math.min(1,i/160,(31999-i)/160);
  signal?.throwIfAborted();
  return {source:{channels:[source,source],sampleRate},chip:{channels:[left,right],sampleRate},
   plot:{source:pcm,converted:left.subarray(8000,8064)},
   metadata:{format:'PCM -> BRR -> real S-DSP',softwarePreparation:true,sampleRate,frequencyHz,cycleFrames,
    encodedBytes:encoded.brr.length,blockCount:encoded.blockCount,loopStartSamples:encoded.loopStartSamples,
    paddingFrames:encoded.paddingFrames,hardwarePitch:4096,durationSeconds:left.length/sampleRate,outputGain,metrics:encoded.metrics}};
 }finally{if(snes)snes.dispose();else core.dispose();}
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
const output=process.argv[2]?resolve(process.argv[2]):fileURLToPath(new URL('../../../../output/snes-03-pcm-to-brr.wav',import.meta.url));
await mkdir(dirname(output),{recursive:true});await writeFile(output,encodeWav({left,right,sampleRate},{gain:1}));
console.log(output+'\n'+JSON.stringify({...result.metadata,frames:left.length,verifiedFrequencyHz:frequency,verifiedAcRms:acRms},null,2));

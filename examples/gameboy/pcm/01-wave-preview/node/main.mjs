// Node.js 22+: original source, software preparation and real chip render. No audio device.
// Software cycle selection/4-bit quantization, followed by a private real Game Boy APU.
import {renderGameboySampleComparison,renderGameboySamplePreview} from 'tetorica-fm2612/playground_sample_gameboy_preview.js';
import moduleFactory from 'tetorica-fm2612/generated/gameboy_apu_wasm.js';
export const wasmAsset='generated/gameboy_apu_wasm.wasm';
export async function renderExample({wasmBinary,signal}={}){
 signal?.throwIfAborted();const cycleFrames=96,rootMidi=69,sourceFrequencyHz=440;
 const cycle=Float32Array.from({length:cycleFrames},(_,i)=>.45*Math.sin(2*Math.PI*i/cycleFrames)+.10*Math.sin(6*Math.PI*i/cycleFrames));
 const audio={channels:[cycle],sampleRate:cycleFrames*sourceFrequencyHz};
 const settings={startFrame:0,endFrame:cycleFrames,rootMidi,tuneCents:0,gainDb:0};
 const comparison=renderGameboySampleComparison(audio,settings);
 const preview=await renderGameboySamplePreview(audio,settings,{moduleFactory,moduleOptions:{wasmBinary}});
 signal?.throwIfAborted();
 // The preview already contains its documented listening gain and 5-ms fades.
 // Do not multiply those chip channels again. Apply the same gain only to the
 // original comparison signal, which has not passed through that helper.
 const frames=preview.channels[0].length,source=new Float32Array(frames),fadeFrames=Math.round(.005*preview.sampleRate);
 for(let i=0;i<frames;i++)source[i]=(.45*Math.sin(2*Math.PI*sourceFrequencyHz*i/preview.sampleRate)+.10*Math.sin(6*Math.PI*sourceFrequencyHz*i/preview.sampleRate))*preview.outputGain*Math.min(1,i/fadeFrames,(frames-1-i)/fadeFrames);
 return {source:{channels:[source,source],sampleRate:preview.sampleRate},chip:{channels:preview.channels,sampleRate:preview.sampleRate},
  plot:{source:comparison.source,converted:Float32Array.from(comparison.waveform,value=>value/7.5-1)},
  metadata:{format:'PCM cycle -> 32 x 4-bit Wave RAM -> real Game Boy APU',softwarePreparation:true,
   sampleRate:preview.sampleRate,sourceFrequencyHz,frequencyHz:preview.frequencyHz,cycleFrames,rootMidi,
   waveRam:Array.from(comparison.waveform),waveRamSamples:comparison.waveform.length,
   durationSeconds:preview.durationSeconds,outputGain:preview.outputGain,endpointFadeSeconds:.005,extraPreviewGain:1}};
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
const output=process.argv[2]?resolve(process.argv[2]):fileURLToPath(new URL('../../../../../output/gameboy-pcm-01-wave-preview.wav',import.meta.url));
await mkdir(dirname(output),{recursive:true});await writeFile(output,encodeWav({left,right,sampleRate},{gain:1}));
console.log(output+'\n'+JSON.stringify({...result.metadata,frames:left.length,verifiedFrequencyHz:frequency,verifiedAcRms:acRms},null,2));

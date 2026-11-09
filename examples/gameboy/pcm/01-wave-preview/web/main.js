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

// This page owns only a disposable Web Audio player. Chip rendering above is
// offline: it owns no sound device and releases the native core in finally.
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
const play=document.getElementById('play'),sourcePlay=document.getElementById('sourcePlay'),stop=document.getElementById('stop'),save=document.getElementById('save'),status=document.getElementById('status'),detail=document.getElementById('detail');
let active=null,cached=null;
function buttons(){play.disabled=sourcePlay.disabled=Boolean(active);stop.disabled=!active;save.disabled=!cached;}
function plot(result){
 const canvas=document.getElementById('comparison'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle='#aab8c2';ctx.beginPath();ctx.moveTo(0,canvas.height/2);ctx.lineTo(canvas.width,canvas.height/2);ctx.stroke();
 for(const[values,color]of [[result.plot.source,'#196b9b'],[result.plot.converted,'#e08128']]){ctx.strokeStyle=color;ctx.beginPath();for(let i=0;i<values.length;i++){const x=i/(values.length-1)*canvas.width,y=(.5-values[i]*.4)*canvas.height;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
 detail.textContent=JSON.stringify(result.metadata,null,2);
}
async function close(run){if(run.cleanup)return run.cleanup;run.cleanup=(async()=>{try{run.source?.stop();}catch{}try{run.source?.disconnect();}catch{}if(run.context&&run.context.state!=='closed')await run.context.close();})();return run.cleanup;}
async function start(kind){
 if(active)return;
 // Create and resume within the trusted Play gesture, before fetching WASM.
 const run={controller:new AbortController(),context:null,source:null,cleanup:null};active=run;buttons();status.textContent='Preparing…';
 try{
  run.context=new AudioContext();const resumed=run.context.resume();resumed.catch(()=>{});
  await resumed;run.controller.signal.throwIfAborted();
  let result=cached;
  if(!result){const response=await fetch(runtimeAssetUrl(wasmAsset),{signal:run.controller.signal});if(!response.ok)throw Error('WASM HTTP '+response.status);const wasmBinary=await response.arrayBuffer();run.controller.signal.throwIfAborted();result=await renderExample({wasmBinary,signal:run.controller.signal});}
  run.controller.signal.throwIfAborted();if(active!==run)return;cached=result;plot(result);buttons();
  const audio=kind==='source'?result.source:result.chip,buffer=run.context.createBuffer(audio.channels.length,audio.channels[0].length,audio.sampleRate);
  for(let channel=0;channel<audio.channels.length;channel++)buffer.copyToChannel(audio.channels[channel],channel);
  run.source=run.context.createBufferSource();run.source.buffer=buffer;run.source.connect(run.context.destination);
  const ended=new Promise(resolve=>{run.source.onended=resolve;});run.source.start();status.textContent=kind==='source'?'Playing source…':'Playing chip…';
  await ended;if(active===run&&!run.controller.signal.aborted)status.textContent='Finished.';
 }catch(error){if(active===run)status.textContent=run.controller.signal.aborted?'Stopped.':'Error: '+error.message;}
 finally{await close(run);if(active===run){active=null;buttons();}}
}
play.addEventListener('click',()=>{void start('chip');});sourcePlay.addEventListener('click',()=>{void start('source');});
stop.addEventListener('click',()=>{const run=active;if(!run)return;status.textContent='Stopping…';run.controller.abort(new DOMException('Stopped','AbortError'));void close(run).then(()=>{if(active===run){active=null;status.textContent='Stopped.';buttons();}});});
save.addEventListener('click',()=>{if(!cached)return;const audio=cached.chip,url=URL.createObjectURL(new Blob([encodeWav({left:audio.channels[0],right:audio.channels[1],sampleRate:audio.sampleRate},{gain:1})],{type:'audio/wav'}));const link=document.createElement('a');link.href=url;link.download='converted-chip.wav';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
window.addEventListener('pagehide',()=>{if(active){active.controller.abort();void close(active);}});
buttons();

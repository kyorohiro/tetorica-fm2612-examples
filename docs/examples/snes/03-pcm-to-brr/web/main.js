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

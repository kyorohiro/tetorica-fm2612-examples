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

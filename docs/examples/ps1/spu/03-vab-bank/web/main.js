import {readVab,prepareVabTone,exportVab,MAX_VAB_FILE_BYTES} from 'tetorica-fm2612/ps1_vab.js';
import {createPs1Audio} from 'tetorica-fm2612/playground_ps1_audio.js';
import {createPs1Client} from 'tetorica-fm2612/playground_ps1.js';

const $=id=>document.getElementById(id);
const OUTPUT_GAIN=0.6;
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
let bank=null,bankName='',selection=null,readEpoch=0,readController=null,activeRun=null,disposed=false;

$('code').value=`const {spu}=await startAudio();
// prepared contains the original Tone's bounded ADPCM, tuning and ADSR.
const instrument=await spu.loadADPCM(prepared.adpcm,prepared.options);
spu.setReverb({preset:'off',volumeLeft:0,volumeRight:0});
spu.setPreset(0,{...prepared.preset,sample:instrument});
console.log({program:prepared.tone.program,tone:prepared.tone.index,
  sample:instrument,sourceReverbSend:prepared.preset.reverb});
spu.noteOn(0,note);
await sleep(0.6);
spu.keyOff(0); // Original hardware Release rate, without replacing ADSR.
await sleep(0.15);`;

function refresh(){
  $('play').disabled=!selection||Boolean(activeRun)||disposed;
  $('stop').disabled=!activeRun||activeRun.closing;
  $('export-tone').disabled=!selection||disposed;
  document.body.dataset.bankLoaded=String(Boolean(bank));
  document.body.dataset.selectionReady=String(Boolean(selection));
  document.body.dataset.toneNumber=selection?String(selection.toneNumber):'';
  document.body.dataset.loading=String(Boolean(readController));
}

// A Program has at most sixteen Tones. Validate only this menu, retaining one
// prepared payload rather than decoded PCM or a bank-sized audio cache.
function prepareView(candidate,programNumber,preferredTone){
  const program=candidate.programs.find(item=>item.index===programNumber);
  if(!program)throw new RangeError('Choose a Program from this bank');
  const tones=program.tones.map(tone=>{
    const toneNumber=candidate.tones.indexOf(tone);
    try{prepareVabTone(candidate,toneNumber);return{tone,toneNumber,reason:''};}
    catch(error){return{tone,toneNumber,reason:error.message};}
  });
  const chosen=tones.find(item=>item.toneNumber===preferredTone&&!item.reason)??tones.find(item=>!item.reason);
  return{program,tones,selection:chosen?{toneNumber:chosen.toneNumber,prepared:prepareVabTone(candidate,chosen.toneNumber)}:null};
}

function showView(view){
  $('program').value=String(view.program.index);
  $('tone').replaceChildren(...view.tones.map(({tone,toneNumber,reason})=>{
    const option=new Option(`Tone ${tone.index} · Sample ${tone.sample}${reason?' · unavailable: '+reason:''}`,String(toneNumber));
    option.disabled=Boolean(reason);option.title=reason;return option;
  }));
  $('tone').disabled=!view.selection;
  selection=view.selection;
  if(selection)$('tone').value=String(selection.toneNumber);
  const prepared=selection?.prepared;
  $('detail').textContent=JSON.stringify({bank:bankName,version:bank.version,program:view.program.index,
    ...(prepared?{tone:prepared.tone.index,toneNumber:selection.toneNumber,sample:prepared.tone.sample,
      sourceSampleBytes:bank.samples.find(item=>item.index===prepared.tone.sample).bytes.length,
      adpcmBytes:prepared.adpcm.length,trimmedBytes:prepared.trimmedBytes,
      baseFrequencyHz:prepared.options.baseFrequencyHz,loopStartSamples:prepared.options.loopStartSamples??null,
      adsr1:prepared.preset.adsr1,adsr2:prepared.preset.adsr2,sourceReverbSend:prepared.preset.reverb,
      sharedReverb:'off',keyRange:[prepared.tone.keyLow,prepared.tone.keyHigh]}:{unavailable:view.tones.map(item=>item.reason)})},null,2);
  refresh();
}

async function loadBank(name,read){
  const operation=++readEpoch;readController?.abort();
  const controller=new AbortController();readController=controller;
  $('status').textContent='Reading '+name+'…';refresh();
  try{
    const bytes=await read(controller.signal);controller.signal.throwIfAborted();
    if(disposed||operation!==readEpoch)return;
    if(bytes.byteLength>MAX_VAB_FILE_BYTES)throw new RangeError('VAB exceeds 1 MiB');
    const candidate=readVab(bytes),view=prepareView(candidate,candidate.programs[0].index);
    // Pure validation finishes before changing the opened bank or stopping a
    // previous note. Bad or stale reads leave both the bank and selection.
    if(disposed||operation!==readEpoch)return;
    void stopAudio().catch(reportCleanup);bank=candidate;bankName=name;
    $('program').replaceChildren(...bank.programs.map(program=>new Option(`Program ${program.index}`,String(program.index))));
    $('program').disabled=false;showView(view);
    $('status').textContent=`Loaded ${name}: ${bank.programs.length} Programs, ${bank.tones.length} Tones. Select a Tone, then Play.`;
  }catch(error){
    if(!disposed&&operation===readEpoch&&!controller.signal.aborted)$('status').textContent=`Load failed: ${error.message}${bank?' Previous bank and selection kept.':''}`;
  }finally{if(operation===readEpoch){readController=null;refresh();}}
}

$('load-demo').addEventListener('click',()=>void loadBank('demo.vab',async signal=>{
  const response=await fetch(new URL('../assets/demo.vab',import.meta.url),{signal});
  if(!response.ok)throw new Error('HTTP '+response.status);return response.arrayBuffer();
}));
$('load-local').addEventListener('click',()=>{$('vab-file').value='';$('vab-file').click();});
$('vab-file').addEventListener('change',()=>{
  const file=$('vab-file').files[0];$('vab-file').value='';
  if(!file){$('status').textContent=bank?'Selection cancelled. Previous bank and selection kept.':'Selection cancelled.';return;}
  void loadBank(file.name,()=>{if(file.size>MAX_VAB_FILE_BYTES)throw new RangeError('VAB exceeds 1 MiB');return file.arrayBuffer();});
});
$('vab-file').addEventListener('cancel',()=>{$('status').textContent=bank?'Selection cancelled. Previous bank and selection kept.':'Selection cancelled.';});
for(const id of ['program','tone'])$(id).addEventListener('change',()=>{
  try{
    const view=prepareView(bank,Number($('program').value),id==='tone'?Number($('tone').value):undefined);
    void stopAudio().catch(reportCleanup);showView(view);$('status').textContent='Selection prepared. Press Play to hear it.';
  }catch(error){$('status').textContent='Selection failed: '+error.message;}
  $(id).blur();
});

$('export-tone').addEventListener('click',()=>{
  if(!bank||!selection)return;
  try{
    const bytes=exportVab(bank,{toneNumber:selection.toneNumber}),tone=selection.prepared.tone;
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));
    const link=document.createElement('a');link.href=url;link.download=`${bankName.replace(/\.vab$/i,'')}-p${tone.program}-t${tone.index}.vab`;
    link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('status').textContent='Exported original Tone as standard VAB · Program '+tone.program+' / Tone 0 / Sample 1.';
  }catch(error){$('status').textContent='Export failed: '+error.message;}
});

function sleep(seconds,signal){
  if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw new RangeError('sleep expects 0..60 seconds');
  signal.throwIfAborted();return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},seconds*1000);
    function abort(){clearTimeout(timer);signal.removeEventListener('abort',abort);reject(signal.reason);}
    signal.addEventListener('abort',abort,{once:true});
  });
}

function closeAudio(run){
  if(run.cleanup)return run.cleanup;run.closing=true;refresh();
  run.cleanup=(async()=>{
    // A short software transport fade avoids chopping a long source Release.
    // It changes only the host output, never the saved ADPCM or ADSR codes.
    if(run.gain){
      const gain=run.gain.gain,now=run.context.currentTime;gain.cancelScheduledValues(now);
      if(run.context.state==='running'){gain.setValueAtTime(gain.value,now);gain.linearRampToValueAtTime(0,now+0.008);await new Promise(resolve=>setTimeout(resolve,12));}
      else gain.setValueAtTime(0,now);
    }
    try{await run.initializing;}catch{/* Reported by Play; include late endpoints in cleanup. */}
    try{
      try{run.spu?.allNotesOff();}
      finally{try{run.spu?.dispose();}finally{try{run.endpoint?.dispose();}finally{run.endpoint?.port.close();}}}
    }
    finally{try{run.gain?.disconnect();}finally{if(run.context&&run.context.state!=='closed')await run.context.close();}}
  })();return run.cleanup;
}
async function stopAudio(){
  const run=activeRun;if(!run)return;
  if(!run.controller.signal.aborted)run.controller.abort(new DOMException('Stopped','AbortError'));
  $('audio-status').textContent='Stopping…';await closeAudio(run);
}
function reportCleanup(error){if(!disposed)$('audio-status').textContent='Cleanup error: '+error.message;}
$('stop').addEventListener('click',()=>void stopAudio().catch(reportCleanup));

$('play').addEventListener('click',async()=>{
  if(activeRun||!selection||disposed)return;
  const chosen=selection,run={controller:new AbortController(),context:null,gain:null,endpoint:null,spu:null,initializing:null,cleanup:null,closing:false,started:false};
  activeRun=run;refresh();$('audio-status').textContent='Loading audio…';
  let result='Finished.';
  try{
    const execute=new AsyncFunction('startAudio','prepared','note','sleep','console',`'use strict';\n${$('code').value}`);
    const prepared=structuredClone(chosen.prepared),note=$('note').value.trim();
    if(!note)throw new TypeError('Enter a note such as C4');
    // Only this explicit Play gesture allocates an AudioContext. The upper
    // menus used readVab/prepareVabTone without touching audio or the network.
    run.context=new AudioContext();await run.context.resume();run.controller.signal.throwIfAborted();
    run.gain=run.context.createGain();run.gain.gain.value=OUTPUT_GAIN;run.gain.connect(run.context.destination);
    function startAudio(){
      run.controller.signal.throwIfAborted();if(run.started||run.closing)throw new Error('Call startAudio once per Play');run.started=true;
      run.initializing=(async()=>{
        run.endpoint=await createPs1Audio(run.context,run.gain,{signal:run.controller.signal,onError(error){run.failure=error;run.controller.abort(error);void closeAudio(run).catch(()=>{});}});
        run.controller.signal.throwIfAborted();
        run.spu=createPs1Client(run.endpoint.port,{sampleRate:run.endpoint.sampleRate,state:run.endpoint.state});
        $('audio-status').textContent='Playing selected note…';return{spu:run.spu};
      })();return run.initializing;
    }
    const output=Object.fromEntries(['log','warn','error'].map(method=>[method,(...values)=>{
      console[method](...values);
      if(activeRun===run)$('audio-status').textContent='Playing · '+values.map(value=>typeof value==='string'?value:JSON.stringify(value)).join(' ').slice(0,700);
    }]));
    await execute(startAudio,prepared,note,seconds=>sleep(seconds,run.controller.signal),output);run.controller.signal.throwIfAborted();
  }catch(error){result=run.failure?'Audio error: '+run.failure.message:run.controller.signal.aborted?'Stopped.':'Error: '+error.message;}
  finally{
    try{await closeAudio(run);}catch(error){result='Cleanup error: '+error.message;}
    if(activeRun===run){activeRun=null;refresh();if(!disposed)$('audio-status').textContent=result;}
  }
});

window.addEventListener('pagehide',()=>{disposed=true;readEpoch++;readController?.abort();readController=null;void stopAudio().catch(()=>{});refresh();});
// Keep initial loading free of explicit fetches; source viewing is optional.
$('web-source').addEventListener('toggle',async()=>{
  if(!$('web-source').open||$('web-source').dataset.loaded)return;$('web-source').dataset.loaded='true';
  try{const response=await fetch(new URL('./main.js',import.meta.url));if(!response.ok)throw new Error('HTTP '+response.status);$('web-source-code').textContent=await response.text();}
  catch(error){$('web-source-code').textContent=error.message;}
});
refresh();

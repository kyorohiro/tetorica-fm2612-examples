import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {assembleScspDsp,disassembleScspDsp} from 'tetorica-fm2612/scsp_dsp_assembler.js';
import {gainSource,iirSource} from './programs.js';
const gainWords=assembleScspDsp(gainSource),iirWords=assembleScspDsp(iirSource);
const playButton=document.getElementById('play'),stopButton=document.getElementById('stop');
const executionSelect=document.getElementById('execution'),editor=document.getElementById('code');
const status=document.getElementById('status'),detail=document.getElementById('detail');
const stateView=document.getElementById('state'),listing=document.getElementById('listing');
let activeRun=null;
editor.value=String.raw`const saturn = await useSoundChip('scsp');
setBpm(120);
// JavaScript assembles fields into 512 words. DSP executes the instructions.
const words = assembleScspDsp("000: XSEL=1 YSEL=1 IRA=32 ZERO=1 COEF=0\n001: EWT=1 EWA=0 ZERO=1");
await saturn.applyDspProgram(words, {coefficients:{0:2048,1:0,2:0}});
const pcm = Int16Array.from({length:64},(_,i)=>Math.round(4096*(2*i/64-1)));
const sample = await saturn.loadPCM(pcm, {baseFrequencyHz:44100/64,loopStartSamples:0});
await saturn.setPreset(0, {sample,totalLevel:0,directLevel:0,dspSend:7});
await saturn.setDspReturn({level:7,pan:0});
await saturn.noteOn(0,'A3');
console.log('SCSP_READY');
await beat(40); // 20 seconds at 120 BPM; change BPM to change this duration.
await saturn.noteOff(0);
await beat(2);`;
const errorText=error=>error?.message??String(error);
function report(run,message){
  if(activeRun!==run)return;
  run.messages.push(String(message).slice(0,800));
  if(run.messages.length>16)run.messages.shift();detail.textContent=run.messages.join('\n');
}
function controls(enabled){for(const input of document.querySelectorAll('[data-live]'))input.disabled=!enabled;}
// Read acknowledged state; coalesce drag updates instead of queuing RPCs.
async function readState(run){
  if(run.reading){run.readAgain=true;return;}run.reading=true;
  try{do{
    run.readAgain=false;const state=await run.scsp.getState();
    if(activeRun!==run||run.controller.signal.aborted)return;
    const dsp=state.dsp;
    if(dsp){
      document.getElementById('effect').value=gainWords.every((word,index)=>word===dsp.words[index])?'gain'
        :iirWords.every((word,index)=>word===dsp.words[index])?'iir':'custom';
      document.getElementById('gain').value=String(dsp.coefficients.codes[0]);
      if(document.getElementById('effect').value==='iir')document.getElementById('history').value=String(dsp.coefficients.codes[1]);
    }
    listing.textContent=dsp?disassembleScspDsp(dsp.words):'DSP not configured';
    stateView.textContent=JSON.stringify({sampleRate:state.sampleRate,ramUsedBytes:state.ramUsedBytes,
      dspRam:state.dspRam,samples:state.samples,slot:state.slots[0],
      dsp:dsp?{profile:dsp.profile,revision:dsp.revision,coefficients:dsp.coefficients,
        return:dsp.return,delay:dsp.delay,ram:dsp.ram}:null,
      coefficientRegisters:dsp?.coefficients.codes.map((code,index)=>({address:'0x'+(0x700+2*index).toString(16),
        signedCode:code,registerWord:((code&0x1fff)<<3),multiplier:code/4096}))},null,2);
  }while(run.readAgain);}catch(error){if(!run.controller.signal.aborted){report(run,errorText(error));stop();}}
  finally{run.reading=false;}
}
function live(update){
  const run=activeRun;if(!run?.ready||run.controller.signal.aborted)return;
  run.changes=run.changes.then(async()=>{
    if(activeRun!==run||!run.ready||run.controller.signal.aborted)return;
    await update(run.scsp);if(!run.controller.signal.aborted)await readState(run);
  }).catch(error=>{if(!run.controller.signal.aborted)report(run,errorText(error));});
}
document.getElementById('effect').addEventListener('change',event=>{
  const mode=event.target.value;
  live(async chip=>{
    const words=assembleScspDsp(mode==='gain'?gainSource:iirSource);
    await chip.applyDspProgram(words,{coefficients:mode==='gain'?{0:2048,1:0,2:0}:{0:0,1:3840,2:256}});
  });
});
document.getElementById('gain').addEventListener('input',event=>{
  const code=Number(event.target.value);live(chip=>chip.setDspCoefficients({0:code}));
});
document.getElementById('history').addEventListener('input',event=>{
  const code=Number(event.target.value);live(chip=>chip.setDspCoefficients({1:code,2:4096-code}));
});
document.getElementById('release').addEventListener('click',()=>live(chip=>chip.noteOff(0)));
document.getElementById('retrigger').addEventListener('click',()=>live(chip=>chip.noteOn(0,'A3')));
playButton.addEventListener('click',async()=>{
  if(activeRun)return;
  const run={controller:new AbortController(),runtime:null,scsp:null,ready:false,reading:false,
    readAgain:false,changes:Promise.resolve(),messages:[]};activeRun=run;
  const {signal}=run.controller;let result='Finished.';
  playButton.disabled=true;stopButton.disabled=false;executionSelect.disabled=true;status.textContent='Loading…';detail.textContent='';
  try{
    const pg=Playground({chip:'scsp',logicWorkerUrl:runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus:message=>report(run,message),onLog(line){
        report(run,line);
        if(String(line).includes('SCSP_READY')&&activeRun===run&&!signal.aborted){
          run.ready=true;controls(true);status.textContent='Playing…';void readState(run);
        }
      }});
    run.runtime=pg;await pg.initialize();signal.throwIfAborted();
    run.scsp=pg.megaDrive.primaryApis.scsp;
    pg.setMasterVolume(0.35); // One explicit host gain, no normalization.
    pg.load('saturn-scsp-04-dsp-programs',editor.value);await pg.play('saturn-scsp-04-dsp-programs',{execution:executionSelect.value});
    signal.throwIfAborted();
  }catch(error){result=signal.aborted?'Stopped.':'Error: '+errorText(error);if(!signal.aborted)report(run,result);}
  finally{
    run.ready=false;controls(false);
    try{await run.runtime?.finalize();}catch(error){result='Cleanup error: '+errorText(error);report(run,result);}
    if(activeRun===run){activeRun=null;playButton.disabled=false;stopButton.disabled=true;
      executionSelect.disabled=false;status.textContent=result;}
  }
});
function stop(){
  const run=activeRun;if(!run||run.controller.signal.aborted)return;
  run.controller.abort();run.ready=false;controls(false);stopButton.disabled=true;status.textContent='Stopping…';
  try{run.runtime?.stop();}catch(error){report(run,errorText(error));}
}
stopButton.addEventListener('click',stop);window.addEventListener('pagehide',stop);

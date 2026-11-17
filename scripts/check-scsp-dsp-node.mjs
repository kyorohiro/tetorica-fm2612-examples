// Verify actual published-package SCSP DSP examples without an output device.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const directory=await mkdtemp(join(tmpdir(),'tetorica-scsp-dsp-'));
const results=[];
try{
  for(const lesson of ['04-dsp-programs','05-dsp-delay']){
    const file=join(directory,lesson+'.wav');
    const log=execFileSync(process.execPath,['examples/saturn/scsp/'+lesson+'/node/main.mjs',file],{cwd:root,encoding:'utf8',timeout:30000});
    const result=JSON.parse(log.split('\n').find(line=>line.startsWith('SCSP_DSP_RESULT ')).slice(16));
    const wav=await readFile(file),rate=44100,frames=(wav.length-44)/4;
    assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
    assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);
    assert.equal(wav.readUInt32LE(24),rate);assert.equal(wav.readUInt16LE(34),16);
    assert.equal(wav.readUInt32LE(40),wav.length-44);assert.equal(frames,result.frames);
    let peak=0;for(let at=44;at<wav.length;at+=4){const left=wav.readInt16LE(at),right=wav.readInt16LE(at+2);assert.equal(left,right);peak=Math.max(peak,Math.abs(left));}
    assert(peak>100&&peak<30000,'Significant unclipped mono DSP signal');
    const slice=(start,end)=>wav.subarray(44+Math.round(start*rate)*4,44+Math.round(end*rate)*4);
    const rms=(start,end)=>{let sum=0,squares=0,count=0,minimum=32767,maximum=-32768;for(let at=Math.round(start*rate);at<Math.round(end*rate);at++){const value=wav.readInt16LE(44+at*4);sum+=value;squares+=value*value;minimum=Math.min(minimum,value);maximum=Math.max(maximum,value);count++;}assert(maximum-minimum>200,'Sustained DSP waveform must vary, not just DC');return Math.sqrt(Math.max(0,squares/count-(sum/count)**2));};
    if(lesson==='04-dsp-programs'){
      assert.equal(result.ramUnchanged,true);assert.equal(result.profile,'ram-free');assert.equal(frames,83790);
      assert(rms(.15,.5)>100&&rms(1.05,1.4)>100,'Gain and IIR both render audible AC');
      assert(Math.abs(rms(.15,.5)-rms(1.05,1.4))>50,'Gain and IIR change the actual waveform');
      assert(slice(1.8,1.9).every(value=>value===0),'Stop silences the offline DSP');
    }else{
      assert.equal(result.pcmUnchanged,true);assert.equal(result.profile,'delay-ring');assert.equal(result.ram.byteLength,65536);
      assert.equal(result.ram.address%8192,0);assert(result.ram.address>0);assert.equal(frames,50715);
      assert(slice(0,.119).every(value=>value===0),'Wet output waits for the real Delay');
      const first=rms(.125,.165),second=rms(.245,.285);
      assert(first>100,'Echo survives noteOff');assert(second/first>.4&&second/first<.6,'Feedback halves the second echo');
      assert(slice(1.05,1.15).every(value=>value===0),'Stop silences the remaining tail');
    }
    results.push({...result,peak:peak/32768});
  }
  console.log(JSON.stringify({passed:true,outputDeviceOpened:false,results},null,2));
}finally{await rm(directory,{recursive:true,force:true});}

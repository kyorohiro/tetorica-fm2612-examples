import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

function checkPokeyWav(id, wav) {
  assert.equal(wav.toString('ascii',12,16),'fmt ',`${id}: PCM format chunk`);
  assert.equal(wav.readUInt32LE(16),16,`${id}: PCM format size`);
  assert.equal(wav.readUInt16LE(20),1,`${id}: integer PCM`);
  assert.equal(wav.readUInt16LE(22),2,`${id}: stereo WAV container`);
  assert.equal(wav.readUInt32LE(24),44100,`${id}: sample rate`);
  assert.equal(wav.readUInt32LE(28),44100*4,`${id}: byte rate`);
  assert.equal(wav.readUInt16LE(32),4,`${id}: stereo frame alignment`);
  assert.equal(wav.readUInt16LE(34),16,`${id}: PCM16`);
  assert.equal(wav.toString('ascii',36,40),'data',`${id}: PCM data chunk`);
  assert.equal(wav.readUInt32LE(4),wav.length-8,`${id}: RIFF size`);
  assert.equal(wav.readUInt32LE(40),wav.length-44,`${id}: PCM data size`);
  const noise=id==='pokey/noise/01-distortion-joined';
  const phrases=noise?[...Array(4).fill([.45,.1]),...Array(4).fill([.35,.1])]:Array(8).fill([.32,.08]);
  const frames=phrases.reduce((sum,[on,off])=>sum+Math.round(on*44100)+Math.round(off*44100),4410);
  assert.equal(wav.length,44+frames*4,`${id}: complete phrase and 0.1-second tail`);
  let minimum=32767,maximum=-32768,sum=0,sumSquares=0;
  for(let offset=44;offset<wav.length;offset+=4){
    const left=wav.readInt16LE(offset),right=wav.readInt16LE(offset+2);
    assert(Number.isFinite(left)&&Number.isFinite(right),`${id}: finite PCM`);
    assert.equal(left,right,`${id}: POKEY is mono; dual routing sums two mono cores`);
    assert(left!==-32768&&left!==32767,`${id}: clipped output`);
    minimum=Math.min(minimum,left);maximum=Math.max(maximum,left);
    sum+=left;sumSquares+=left*left;
  }
  const mean=sum/frames,acRms=Math.sqrt(Math.max(0,sumSquares/frames-mean*mean));
  assert(maximum-minimum>512&&acRms>100,`${id}: significant AC audio and dynamic range`);
  assert(minimum < -32 && maximum > 32,`${id}: speaker output must cross zero`);
  assert(Math.abs(mean)<acRms*.15,`${id}: excessive speaker DC offset`);
  function assertAudibleWindow(start,end,label){
    let phaseSum=0,phaseSquares=0,phaseMinimum=32767,phaseMaximum=-32768;
    for(let active=start;active<end;active++){
      const sample=wav.readInt16LE(44+active*4);
      phaseSum+=sample;phaseSquares+=sample*sample;
      phaseMinimum=Math.min(phaseMinimum,sample);phaseMaximum=Math.max(phaseMaximum,sample);
    }
    const phaseFrames=end-start,phaseMean=phaseSum/phaseFrames;
    assert(Math.sqrt(Math.max(0,phaseSquares/phaseFrames-phaseMean*phaseMean))>100&&phaseMaximum-phaseMinimum>512,`${id}: ${label} has sustained AC audio`);
  }
  let frame=0;
  for(const [index,[on,off]] of phrases.entries()){
    const activeEnd=frame+Math.round(on*44100);
    // Exclude the first 25 ms so a DC-blocker startup pulse cannot pass as a
    // sustained tone/noise phrase, especially in the joined-channel section.
    assertAudibleWindow(frame+Math.round(.025*44100),activeEnd,`phrase ${index+1}`);
    if(id==='pokey/dual/01-eight-channels'){
      const secondCore=frame+Math.round(.16*44100);
      assertAudibleWindow(frame+Math.round(.025*44100),secondCore,`phrase ${index+1}, both cores`);
      assertAudibleWindow(secondCore+Math.round(.025*44100),activeEnd,`phrase ${index+1}, core B after core A notes-off`);
    }
    frame=activeEnd;
    const end=frame+Math.round(off*44100);
    assert(wav.subarray(44+frame*4,44+end*4).every(value=>value===0),`${id}: notes-off speaker silence`);
    frame=end;
  }
  assert(wav.subarray(44+frame*4).every(value=>value===0),`${id}: exact speaker tail silence`);
  console.log(`PASS ${id}: ${frames} frames, peak ${(Math.max(-minimum,maximum)/32768).toFixed(6)}, AC RMS ${(acRms/32768).toFixed(6)}, DC/AC ${(Math.abs(mean)/acRms).toFixed(4)}; mono PCM16, 8 audible phrases, exact silent gaps/tail`);
}

function checkPcEngineCdWav(id, wav) {
  const sampleRate=48000,frames=(wav.length-44)/4;
  const seconds=id==='pc-engine-cd/cdda/01-stereo-tracks'?3.6:id==='pc-engine-cd/adpcm/01-sample'?2.6:3;
  assert.equal(wav.toString('ascii',12,16),'fmt ',`${id}: PCM format chunk`);
  assert.equal(wav.readUInt32LE(16),16,`${id}: PCM format size`);
  assert.equal(wav.readUInt16LE(20),1,`${id}: integer PCM`);
  assert.equal(wav.readUInt16LE(22),2,`${id}: stereo container`);
  assert.equal(wav.readUInt32LE(24),sampleRate,`${id}: 48 kHz output`);
  assert.equal(wav.readUInt32LE(28),sampleRate*4,`${id}: byte rate`);
  assert.equal(wav.readUInt16LE(32),4,`${id}: frame alignment`);
  assert.equal(wav.readUInt16LE(34),16,`${id}: PCM16`);
  assert.equal(wav.toString('ascii',36,40),'data',`${id}: PCM data chunk`);
  assert.equal(wav.readUInt32LE(4),wav.length-8,`${id}: RIFF size`);
  assert.equal(wav.readUInt32LE(40),wav.length-44,`${id}: data size`);
  assert.equal(frames,Math.round(seconds*sampleRate),`${id}: complete finite timeline`);
  const sample=(frame,channel=0)=>wav.readInt16LE(44+frame*4+channel*2)/32768;
  const at=seconds=>Math.round(seconds*sampleRate);
  const slice=(start,end)=>wav.subarray(44+at(start)*4,44+at(end)*4);
  const silent=(start,end,label)=>assert(slice(start,end).every(value=>value===0),`${id}: exact ${label} silence`);
  function rms(start,end,channel=0){
    let squares=0;for(let i=at(start);i<at(end);++i){const value=sample(i,channel);squares+=value*value;}
    return Math.sqrt(squares/(at(end)-at(start)));
  }
  // Quadrature amplitude over sustained windows identifies actual source
  // frequencies, so a startup pulse/DC offset cannot pass as an audible voice.
  function tone(start,end,hz,channel=0){
    let real=0,imaginary=0;const first=at(start),last=at(end);
    for(let i=first;i<last;++i){const value=sample(i,channel),phase=2*Math.PI*hz*(i-first)/sampleRate;
      real+=value*Math.cos(phase);imaginary+=value*Math.sin(phase);}
    return 2*Math.hypot(real,imaginary)/(last-first);
  }
  let peak=0,stereo=false,sum=0,squares=0;
  for(let i=0;i<frames;++i){
    const left=sample(i),right=sample(i,1);
    assert(Number.isFinite(left)&&Number.isFinite(right),`${id}: finite output`);
    assert(Math.abs(left)<0.95&&Math.abs(right)<0.95,`${id}: clipped output`);
    peak=Math.max(peak,Math.abs(left),Math.abs(right));stereo ||= left!==right;sum+=left;squares+=left*left;
  }
  const mean=sum/frames,acRms=Math.sqrt(Math.max(0,squares/frames-mean*mean));
  assert(acRms>0.005,`${id}: audible AC output`);
  assert(Math.abs(mean)<acRms*.1,`${id}: excessive output DC`);
  if(id==='pc-engine-cd/cdda/01-stereo-tracks'){
    assert(stereo,`${id}: stereo source must remain separate`);
    assert(tone(.1,.4,220)>0.06&&tone(.1,.4,330,1)>0.06,`${id}: track 2 left/right frequencies`);
    assert(tone(1.8,2.1,440)>0.06&&tone(1.8,2.1,660,1)>0.06,`${id}: track 3 left/right frequencies`);
    assert(tone(.1,.4,330)<0.001&&tone(.1,.4,220,1)<0.001,`${id}: channels were incorrectly folded or swapped`);
    silent(.6,.8,'Pause');silent(2.8,3,'EOF');silent(3.4,3.6,'Stop');
    assert(tone(.85,1.15,220)>0.06,`${id}: Resume has sustained track 2 audio`);
    assert.deepEqual(slice(1.2,1.4),slice(.2,.4),`${id}: Seek returns to the exact track-relative source position`);
    assert.deepEqual(slice(3,3.2),slice(.25,.45),`${id}: replay offset returns to the exact track-relative source position`);
  }else if(id==='pc-engine-cd/adpcm/01-sample'){
    assert(!stereo,`${id}: mono ADPCM must be duplicated identically`);
    for(const [start,end]of[[.1,.4],[.9,1.2],[1.43,1.58],[1.9,2.2]]){
      assert(tone(start,end,220)>0.075,`${id}: sustained 220 Hz in the initial, odd-nibble and second-loop/replay windows`);
    }
    const firstLoop=rms(.9,1.2),nextLoop=rms(1.43,1.58);
    assert(nextLoop/firstLoop>.9&&nextLoop/firstLoop<1.1,`${id}: continuing decoder predictor caused loop gain growth`);
    silent(.6,.8,'initial EOF');silent(1.6,1.8,'Stop');silent(2.4,2.6,'replay EOF');
    assert.deepEqual(slice(0,.6),slice(1.8,2.4),`${id}: replay must reset the decoder and source phase`);
  }else{
    assert.equal(id,'pc-engine-cd/mix/01-three-sources');assert(stereo,`${id}: stereo CD-DA and source pan retained`);
    const cdLeft=tone(.1,.4,220),cdRight=tone(.1,.4,330,1);
    const psgLeft=tone(.7,1,440),psgRight=tone(.7,1,440,1);
    const adpcmLeft=tone(1.3,1.6,880),adpcmRight=tone(1.3,1.6,880,1);
    assert(cdLeft>.03&&cdRight>.03,`${id}: standalone CD-DA source contribution`);
    assert(psgLeft>.008&&psgRight>.01,`${id}: actual HuC6280 A4 source contribution`);
    assert(adpcmLeft>.04&&adpcmRight>.028,`${id}: actual MSM5205 880 Hz source contribution`);
    assert(psgLeft/psgRight>.77&&psgLeft/psgRight<.83,`${id}: PSG source pan +0.2`);
    assert(adpcmRight/adpcmLeft>.67&&adpcmRight/adpcmLeft<.73,`${id}: ADPCM source pan -0.3`);
    assert(tone(.7,1,220)<.001&&tone(.7,1,330,1)<.001&&tone(.7,1,880)<.001,`${id}: PSG-only phase contains another source`);
    assert(tone(1.3,1.6,220)<.001&&tone(1.3,1.6,330,1)<.001,`${id}: muted CD-DA leaked into ADPCM-only phase`);
    const mixedCd=tone(1.9,2.2,220),mixedPsg=tone(1.9,2.2,440),mixedAdpcm=tone(1.9,2.2,880);
    assert(mixedCd>cdLeft*.9&&mixedCd<cdLeft*1.1,`${id}: CD-DA gain changed in the ensemble`);
    assert(mixedPsg>psgLeft*.9&&mixedPsg<psgLeft*1.1,`${id}: PSG gain applied twice or lost in the ensemble`);
    assert(mixedAdpcm>adpcmLeft*.85&&mixedAdpcm<adpcmLeft*1.15,`${id}: ADPCM gain/loop changed in the ensemble`);
    silent(2.8,3,'three-source Stop');
  }
  console.log(`PASS ${id}: ${frames} frames, peak ${peak.toFixed(6)}, AC RMS ${acRms.toFixed(6)}; actual source frequencies, lifecycle, gain routing and exact silent tail`);
}

const root=fileURLToPath(new URL('../', import.meta.url));
const onlyPcEngineCd=process.argv.slice(2).includes('--only=pc-engine-cd');
assert(process.argv.length===2||process.argv.length===3&&onlyPcEngineCd,'Usage: node scripts/check-node.mjs [--only=pc-engine-cd]');
const directory=await mkdtemp(join(tmpdir(), 'tetorica-examples-'));
try {
  const manifest=JSON.parse(await readFile(root+'/examples/manifest.json','utf8'));
  let count=0;
  for(const item of manifest.filter(item=>(!item.environments||item.environments.includes('node'))&&!item.nodeAudioOutput&&(!onlyPcEngineCd||item.id.startsWith('pc-engine-cd/')))){
   const out=join(directory, `${item.id.replaceAll('/', '-')}.wav`);
   execFileSync(process.execPath,[`examples/${item.id}/node/main.mjs`,...((item.id==='embedding/05-vgm-player'||item.id.startsWith('patches/')) ? ['',out] : [out])],{cwd:root,timeout:30000,stdio:'pipe'});
   const wav=await readFile(out); assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
   assert.ok(wav.length>44);assert.ok(wav.subarray(44).some(x=>x!==0));
   if(item.id.startsWith('pokey/'))checkPokeyWav(item.id,wav);
   if(item.id.startsWith('pc-engine-cd/'))checkPcEngineCdWav(item.id,wav);
   if(item.id.startsWith('wonderswan/')) {
    assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);
    assert.equal(wav.readUInt32LE(24),44100);assert.equal(wav.readUInt16LE(34),16);
    let minimum=32767,maximum=-32768,stereoDifference=false;
    for(let offset=44;offset+3<wav.length;offset+=4){
     const left=wav.readInt16LE(offset),right=wav.readInt16LE(offset+2);
     minimum=Math.min(minimum,left,right);maximum=Math.max(maximum,left,right);
     stereoDifference ||= left!==right;
    }
    assert(maximum-minimum>32,`${item.id}: DC-only or silent WAV`);
    if(item.id.includes('/wave/'))assert(stereoDifference,'WonderSwan pan was lost');
   }
   count++;
  }
  for(const file of onlyPcEngineCd?[]:['megasynth-events.json']){
   const data=JSON.parse(await readFile(root+'/output/'+file,'utf8'));assert.equal(data.format,'megasynth-recording-v1');assert.equal(data.commands.length,2);
  }
  if(onlyPcEngineCd)assert.equal(count,3,'Expected all three PC Engine CD Node examples');
  console.log(`PASS ${count} installed-package Node examples: audible WAV${onlyPcEngineCd?'':' + event JSON'}`);

} finally {await rm(directory, {recursive: true, force: true});}

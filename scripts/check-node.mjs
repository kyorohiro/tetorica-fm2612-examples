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
const root=fileURLToPath(new URL('../', import.meta.url));
const directory=await mkdtemp(join(tmpdir(), 'tetorica-examples-'));
try {
  const manifest=JSON.parse(await readFile(root+'/examples/manifest.json','utf8'));
  let count=0;
  for(const item of manifest.filter(item=>(!item.environments||item.environments.includes('node'))&&!item.nodeAudioOutput)){
   const out=join(directory, `${item.id.replaceAll('/', '-')}.wav`);
   execFileSync(process.execPath,[`examples/${item.id}/node/main.mjs`,...((item.id==='embedding/05-vgm-player'||item.id.startsWith('patches/')) ? ['',out] : [out])],{cwd:root,timeout:30000,stdio:'pipe'});
   const wav=await readFile(out); assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
   assert.ok(wav.length>44);assert.ok(wav.subarray(44).some(x=>x!==0));
   if(item.id.startsWith('pokey/'))checkPokeyWav(item.id,wav);
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
  for(const file of ['megasynth-events.json']){
   const data=JSON.parse(await readFile(root+'/output/'+file,'utf8'));assert.equal(data.format,'megasynth-recording-v1');assert.equal(data.commands.length,2);
  }
  console.log(`PASS ${count} installed-package Node examples: audible WAV + event JSON`);

} finally {await rm(directory, {recursive: true, force: true});}

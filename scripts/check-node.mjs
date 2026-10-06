import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../', import.meta.url));
const directory=await mkdtemp(join(tmpdir(), 'tetorica-examples-'));
try {
  const manifest=JSON.parse(await readFile(root+'/examples/manifest.json','utf8'));
  let count=0;
  for(const item of manifest.filter(item=>(!item.environments||item.environments.includes('node'))&&!item.nodeAudioOutput)){
   const out=join(directory, `${item.id.replaceAll('/', '-')}.wav`);
   execFileSync(process.execPath,[`examples/${item.id}/node/main.mjs`,...((item.id==='embedding/05-vgm-player'||item.id.startsWith('patches/')) ? ['',out] : [out])],{cwd:root,timeout:30000,stdio:'pipe'});
   const wav=await readFile(out); assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
   assert.ok(wav.length>44);assert.ok(wav.subarray(44).some(x=>x!==0));count++;
  }
  for(const file of ['megasynth-events.json']){
   const data=JSON.parse(await readFile(root+'/output/'+file,'utf8'));assert.equal(data.format,'megasynth-recording-v1');assert.equal(data.commands.length,2);
  }
  console.log(`PASS ${count} installed-package Node examples: audible WAV + event JSON`);

} finally {await rm(directory, {recursive: true, force: true});}

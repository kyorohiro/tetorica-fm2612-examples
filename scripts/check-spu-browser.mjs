// Published npm only: offline SPU WAV + actual muted AudioWorklet output.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import http from 'node:http';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';

const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
for(const value of args)assert(/^(--(?:root|out)=.+|--chromium|--webkit)$/.test(value),'Unknown option '+value);
assert(!(args.includes('--chromium')&&args.includes('--webkit')),'Choose one browser or omit both');
const option=name=>args.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3);
const site=resolve(repository,option('root')??'dist'),output=option('out')?resolve(option('out')):null;
const cases={sample:'ps1/spu/01-sample-adsr',reverb:'ps1/spu/02-reverb'},sha=bytes=>createHash('sha256').update(bytes).digest('hex');

async function nodeChecks(){
 const scratch=await mkdtemp(join(tmpdir(),'tetorica-spu-examples-')),results=[];
 try{
  for(const[kind,id]of Object.entries(cases)){
   const out=join(scratch,kind+'.wav');
   const log=execFileSync(process.execPath,[join(repository,'examples',id,'node/main.mjs'),out],{cwd:repository,timeout:30000,encoding:'utf8'});
   const wav=await readFile(out),rate=44100,frames=(wav.length-44)/4,seconds=kind==='sample'?4.2:5.2;
   assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,16),'WAVEfmt ');
   assert.equal(wav.readUInt32LE(4),wav.length-8);assert.equal(wav.readUInt32LE(16),16);assert.equal(wav.readUInt16LE(20),1);
   assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt32LE(24),rate);assert.equal(wav.readUInt16LE(34),16);
   assert.equal(wav.toString('ascii',36,40),'data');assert.equal(wav.readUInt32LE(40),wav.length-44);assert.equal(frames,Math.round(seconds*rate));
   const sample=(frame,ch=0)=>wav.readInt16LE(44+frame*4+ch*2)/32768;
   const rms=(start,end,ch=0)=>{let sum=0;const first=Math.round(start*rate),last=Math.round(end*rate);for(let i=first;i<last;i++)sum+=sample(i,ch)**2;return Math.sqrt(sum/(last-first));};
   const frequency=(start,end)=>{const crossings=[];for(let i=Math.round(start*rate)+1;i<Math.round(end*rate);i++){const a=sample(i-1),b=sample(i);if(a<=0&&b>0)crossings.push(i-1-a/(b-a));}return rate*(crossings.length-1)/(crossings.at(-1)-crossings[0]);};
   let peak=0;for(let i=0;i<frames;i++)for(let ch=0;ch<2;ch++){const value=sample(i,ch);assert(Number.isFinite(value)&&Math.abs(value)<.95,'Finite unclipped output');peak=Math.max(peak,Math.abs(value));}
   assert(peak>.005);assert(wav.subarray(44+Math.round((seconds-.2)*rate)*4).every(value=>value===0),'Stop clears voices and all effect tails');
   if(kind==='sample'){
    const hz=frequency(.2,.8),held=rms(.25,.8),decreased=rms(1.9,2.1);assert(Math.abs(hz-440)<2,'Explicit112-frame tuning produces A4');
    assert(held>.005&&decreased>held*.4&&decreased<held*.8,'Live Sustain decreases held envelope without retrigger');
    assert(log.includes('112 original PCM frames -> 64 SPU ADPCM bytes'));
    for(let i=0;i<frames;i++)assert.equal(sample(i),sample(i,1),'Dry mono voice is centered');
    results.push({example:id,frames,peak,frequency:hz,heldRms:held,liveSustainRms:decreased,stopTailSilent:true});
   }else{
    assert(rms(.05,.2)>.005,'Dry phase is audible');assert.equal(rms(.4,.7),0);assert.equal(rms(.4,.7,1),0);
    const left=rms(1.4,1.7),right=rms(2.4,2.7,1);assert(left>.0005&&right>.0005,'Each send can feed its wet tail');
    assert.equal(rms(1.4,1.7,1),0,'Right return0 preserves exact right tail silence');assert.equal(rms(2.4,2.7),0,'Left return0 preserves exact left tail silence');
    assert(rms(3.4,3.7)>.0005&&rms(3.4,3.7,1)>.0005);assert(rms(4.4,4.7)>.0005&&rms(4.4,4.7,1)>.0005,'Hall preset has a stereo tail');
    results.push({example:id,frames,peak,leftOnlyTailRms:left,rightOnlyTailRms:right,sharedRoomAndHall:true,stopTailSilent:true});
   }
   console.log('PASS Node '+id+': '+frames+' native44.1k stereo frames, peak '+peak.toFixed(5));
  }
 }finally{await rm(scratch,{recursive:true,force:true});}
 return results;
}

const prefix='/spu-examples/',served=new Map(),missing=[],mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  assert(pathname.startsWith(prefix),'Request escaped static-site prefix');let file=resolve(site,pathname.slice(prefix.length)),local=relative(site,file);
  assert(local!=='..'&&!local.startsWith('..'+sep)&&!local.startsWith(sep),'Request escaped static-site root');
  if((await stat(file)).isDirectory())file=join(file,'index.html');const bytes=await readFile(file),name=relative(site,file).split(sep).join('/');
  served.set(name,{bytes:bytes.length,sha256:sha(bytes)});res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','cache-control':'no-store'}).end(bytes);
 }catch(error){missing.push({url:req.url,error:error.message});res.writeHead(404).end(error.message);}
});
function installAudit(){
 const Context=window.AudioContext??window.webkitAudioContext,Worklet=window.AudioWorkletNode,connect=AudioNode.prototype.connect,post=MessagePort.prototype.postMessage;
 const contexts=[],nodes=[],commands=[],meters=[],failures=[];
 window.AudioContext=new Proxy(Context,{construct(Target,args){const context=Reflect.construct(Target,args);contexts.push(context);return context;}});
 if(window.webkitAudioContext===Context)window.webkitAudioContext=window.AudioContext;
 window.AudioWorkletNode=new Proxy(Worklet,{construct(Target,args){const node=Reflect.construct(Target,args),binary=args[2]?.processorOptions?.wasmBinary;nodes.push({name:args[1],bytes:binary?.byteLength??0});node.addEventListener('processorerror',()=>failures.push(args[1]));return node;}});
 MessagePort.prototype.postMessage=function(data,...rest){
  // loadADPCM transfers its bytes: retaining that detached view makes a later
  // Playwright audit unserializable. Record only the live scalar controls.
  if(['setEnvelope','setReverb','noteOn'].includes(data?.method))commands.push({method:data.method,args:structuredClone(data.args)});
  if(data?.method==='setPreset')commands.push({method:data.method,args:[data.args[0],{reverb:data.args[1]?.reverb}]});
  return post.call(this,data,...rest);
 };
 AudioNode.prototype.connect=function(destination,...rest){
  if(destination!==this.context.destination)return connect.call(this,destination,...rest);
  const context=this.context,splitter=context.createChannelSplitter(2),mute=context.createGain();mute.gain.value=0;
  const analysers=[0,1].map(ch=>{const analyser=context.createAnalyser();analyser.fftSize=4096;connect.call(splitter,analyser,ch);connect.call(analyser,mute);return analyser;});
  // Compute L-R inside one graph quantum. Two separate analyser reads can
  // observe different quanta, even when the physical stereo signal is mono.
  const inverted=context.createGain(),differenceAnalyser=context.createAnalyser();
  inverted.gain.value=-1;differenceAnalyser.fftSize=4096;
  connect.call(splitter,differenceAnalyser,0);connect.call(splitter,inverted,1);
  connect.call(inverted,differenceAnalyser);connect.call(differenceAnalyser,mute);
  connect.call(this,splitter);connect.call(mute,destination);meters.push({context,mute,analysers,differenceAnalyser,peak:0,acRms:0,difference:0,current:null});return destination;
 };
 function sample(){for(const meter of meters){if(meter.context.state!=='running')continue;
  const pcm=meter.analysers.map(analyser=>{const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);return data;}),crossings=[];
  const delta=new Float32Array(meter.differenceAnalyser.fftSize);meter.differenceAnalyser.getFloatTimeDomainData(delta);
  let sum=0,squares=0,peak=0,difference=0;for(let i=0;i<pcm[0].length;i++){const value=pcm[0][i];if(!Number.isFinite(value)||!Number.isFinite(pcm[1][i])||!Number.isFinite(delta[i]))failures.push('Non-finite PCM');sum+=value;squares+=value*value;peak=Math.max(peak,Math.abs(value),Math.abs(pcm[1][i]));difference=Math.max(difference,Math.abs(delta[i]));if(i&&pcm[0][i-1]<=0&&value>0)crossings.push(i-1-pcm[0][i-1]/(value-pcm[0][i-1]));}
  const mean=sum/pcm[0].length,acRms=Math.sqrt(Math.max(0,squares/pcm[0].length-mean*mean)),frequency=crossings.length>4?meter.context.sampleRate*(crossings.length-1)/(crossings.at(-1)-crossings[0]):0;
  meter.peak=Math.max(meter.peak,peak);meter.acRms=Math.max(meter.acRms,acRms);meter.difference=Math.max(meter.difference,difference);meter.current={peak,acRms,frequency,difference};
 }}
 setInterval(sample,20);
 window.__spuAudit={read(){sample();return {contexts:contexts.map(context=>context.state),nodes:[...nodes],commands:[...commands],failures:[...failures],meters:meters.map(({context,mute,peak,acRms,difference,current})=>({state:context.state,muted:mute.gain.value===0,peak,acRms,difference,current}))};}};
}
async function bounded(task,label,timeout=15000){let timer;try{return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Timed out: '+label)),timeout);})]);}finally{clearTimeout(timer);}}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const evaluate=(page,fn,arg)=>bounded(page.evaluate(fn,arg),'browser evaluation');
const audit=page=>evaluate(page,()=>__spuAudit.read());
async function until(page,predicate,label,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){if(await predicate())return;await pause(30);}throw Error(label+'; status='+await page.locator('#status').textContent()+'; detail='+await page.locator('#detail').textContent());}
const status=(page,text)=>until(page,async()=>((await page.locator('#status').textContent())??'').startsWith(text),'Expected '+text);
const closed=page=>until(page,async()=>(await audit(page)).contexts.every(state=>state==='closed'),'AudioContext leak');
const range=(page,id,value)=>evaluate(page,({id,value})=>{const input=document.getElementById(id);input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));},{id,value});
async function checkPage(browser,base,name,kind,id){
 const page=await browser.newPage({serviceWorkers:'block'});page.setDefaultTimeout(15000);const errors=[],consoleErrors=[],failed=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
 const origin=new URL(base).origin;page.on('request',request=>{const url=new URL(request.url());if(url.origin!==origin&&!['blob:','data:'].includes(url.protocol))external.push(url.href);});
 await page.addInitScript(installAudit);
 try{
  await page.goto(base+'examples/'+id+'/web/index.html');await status(page,'Ready.');assert.deepEqual((await audit(page)).contexts,[],'Loading the page must not start audio');
  console.log('CHECK '+name+'/'+kind+': real PCM + live controls');
  await page.click('#play');await status(page,'Playing');await until(page,async()=>(await audit(page)).meters.some(meter=>meter.current?.acRms>.003),'Actual steady PCM');
  if(kind==='sample'){
   await until(page,async()=>(await audit(page)).meters.some(meter=>Math.abs(meter.current?.frequency-440)<3&&meter.current.acRms>.003),'A4 tuning');await pause(180);
   const before=(await audit(page)).meters.at(-1).current.acRms;await range(page,'sustain-rate',64);await pause(650);
   const after=(await audit(page)).meters.at(-1).current.acRms;assert(after<before*.95&&after>before*.25,'Live sustain changes held output without a new note');
   const commands=(await audit(page)).commands;assert(commands.some(command=>command.method==='setEnvelope'&&command.args?.[1]?.sustainRate===64&&command.args?.[2]?.live===true));
   assert.equal(commands.filter(command=>command.method==='noteOn').length,1,'Envelope editing must not retrigger');
  }else{
   await range(page,'return-left',.8);await range(page,'return-right',0);await pause(500);
   assert((await audit(page)).meters.at(-1).difference>.00001,'Left-only return creates real stereo difference');
   await page.uncheck('#send0');await page.check('#send1');await range(page,'return-left',0);await range(page,'return-right',.8);
   await page.selectOption('#preset','hall');await pause(120);
   const commands=(await audit(page)).commands;
   assert(commands.some(command=>command.method==='setReverb'&&command.args?.[0]?.preset==='hall'&&command.args[0].volumeRight===.8));
   assert(commands.some(command=>command.method==='setPreset'&&command.args?.[0]===1&&command.args?.[1]?.reverb===true));
   await page.uncheck('#enable-reverb');await until(page,async()=>(await audit(page)).meters.at(-1).current?.acRms>.003&&(await audit(page)).meters.at(-1).current.difference<1e-7,'Reverb bypass returns to audible centered dry sound');
  }
  await page.click('#stop');await status(page,'Stopped.');await closed(page);
  let value=await audit(page);assert(value.meters.every(meter=>meter.muted&&meter.peak<.95));assert.deepEqual(value.failures,[]);
  const replaySource=await page.locator('#code').inputValue();
  await page.locator('#code').fill(kind==='sample'?replaySource.replace('sleep(4.0)','sleep(0.25)'):replaySource.replace('hit < 6','hit < 1').replace('sleep(0.8)','sleep(0.1)'));
  await page.click('#play');await status(page,'Finished.');await closed(page);value=await audit(page);
  assert.equal(value.contexts.length,2,'Fresh replay owns a new context');assert(value.nodes.every(node=>node.name==='tetorica-playground-ps1'&&node.bytes>10000));
  // Hold an actual new WASM request, then cancel before it can finish loading.
  let held=false,release;const gate=new Promise(resolve=>{release=resolve;});
  await page.route('**/ps1_spu_wasm.wasm',async route=>{held=true;await gate;try{await route.continue();}catch{ /* Deliberately cancelled fetch. */ }});
  try{await page.click('#play');await until(page,async()=>held,'Delayed SPU WASM request');await page.click('#stop');await status(page,'Stopped.');await closed(page);}finally{release();await page.unroute('**/ps1_spu_wasm.wasm');}
  assert.equal(await page.locator('#play').isEnabled(),true);assert.equal(await page.locator('#stop').isEnabled(),false);
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
  return {browser:name,example:id,realPcm:true,liveControls:true,freshReplay:true,stopDuringLoading:true,allContextsClosed:true,meters:value.meters};
 }catch(error){console.error(JSON.stringify({browser:name,kind,errors,consoleErrors,failed,external,audit:await audit(page).catch(()=>null)}));throw error;}
 finally{await bounded(page.close(),'close SPU example page');}
}

try{
 const dependency=JSON.parse(await readFile(join(repository,'package.json'),'utf8')).dependencies['tetorica-fm2612'];
 const vendor=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8'));assert.equal(vendor.version,dependency,'Static vendor matches published dependency');
 const node=await nodeChecks();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base='http://127.0.0.1:'+server.address().port+prefix,results=[];
 const browsers=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
 for(const[name,engine]of browsers){const browser=await bounded(engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})}),'launch '+name,30000);try{for(const[kind,id]of Object.entries(cases))results.push(await checkPage(browser,base,name,kind,id));}finally{await bounded(browser.close(),'close '+name);}}
 assert.deepEqual(missing,[],'No missing assets, repository fallback or external files');
 for(const name of ['playground_ps1_audio.js','playground_ps1_worklet.js','playground_ps1.js','ps1_adpcm_encoder.js','generated/ps1_spu_wasm.wasm'])assert(served.has('vendor/tetorica-fm2612/'+name),'Actual packaged asset used '+name);
 const report={schemaVersion:1,passed:true,packageVersion:vendor.version,physicalOutputMuted:true,listeningPerformed:false,staticSiteOnly:true,node,results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)))};
 if(output){await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');}
 console.log('PASS SPU examples: original112-frame software encoding, native PCM/live ADSR, wet sends/returns, Stop and resource cleanup.');
}finally{server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}

// Final static-site SID examples, real WASM/AudioWorklet, physically muted.
// Build first; no application source or sibling repository can serve as fallback.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
for(const value of args)assert(/^(--(?:root|case|out)=.+|--chromium|--webkit)$/.test(value),'Unknown option '+value);
assert(!(args.includes('--chromium')&&args.includes('--webkit')),'Choose one browser or omit both');
const option=name=>args.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3);
const site=resolve(repository,option('root')??'dist'),output=option('out')?resolve(option('out')):null;
const cases={voices:'c64/sid/01-voices',filter:'c64/sid/02-filter'},selection=option('case');
if(selection)assert(Object.hasOwn(cases,selection),'Unknown SID case '+selection);
const prefix='/examples-site/',served=new Map(),missing=[],sha=data=>createHash('sha256').update(data).digest('hex');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  assert(pathname.startsWith(prefix),'Request escaped static-site prefix');let file=resolve(site,pathname.slice(prefix.length));
  const local=relative(site,file);assert(local!=='..'&&!local.startsWith('..'+sep)&&!local.startsWith(sep),'Request escaped static-site root');
  if((await stat(file)).isDirectory())file=join(file,'index.html');const bytes=await readFile(file),name=relative(site,file).split(sep).join('/'),record={bytes:bytes.length,sha256:sha(bytes)};
  if(served.has(name))assert.deepEqual(served.get(name),record,'Asset changed while testing '+name);served.set(name,record);
  res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','cache-control':'no-store'}).end(bytes);
 }catch(error){missing.push({url:req.url,error:error.message});res.writeHead(404).end(error.message);}
});
function installAudit(){
 const NativeContext=window.AudioContext??window.webkitAudioContext,NativeWorklet=window.AudioWorkletNode,connect=AudioNode.prototype.connect,post=MessagePort.prototype.postMessage;
 const contexts=[],nodes=[],commands=[],failures=[],meters=[];let label='load';
 window.AudioContext=new Proxy(NativeContext,{construct(Target,args){const context=Reflect.construct(Target,args);contexts.push({context,label});return context;}});
 if(window.webkitAudioContext===NativeContext)window.webkitAudioContext=window.AudioContext;
 window.AudioWorkletNode=new Proxy(NativeWorklet,{construct(Target,args){const node=Reflect.construct(Target,args),binary=args[2]?.processorOptions?.wasmBinary;
  const bytes=binary instanceof ArrayBuffer?new Uint8Array(binary):ArrayBuffer.isView(binary)?new Uint8Array(binary.buffer,binary.byteOffset,binary.byteLength):null;
  nodes.push({label,name:args[1],model:args[2]?.processorOptions?.model,wasmBytes:bytes?.length??0,magic:bytes?Array.from(bytes.subarray(0,4)):[]});node.addEventListener('processorerror',()=>failures.push(args[1]));return node;
 }});
 MessagePort.prototype.postMessage=function(data,...rest){if(data?.method==='writeRegister')commands.push({label,register:data.args?.[0],value:data.args?.[1]});return post.call(this,data,...rest);};
 AudioNode.prototype.connect=function(destination,...rest){
  if(destination!==this.context.destination)return connect.call(this,destination,...rest);
  const context=this.context,splitter=context.createChannelSplitter(2),mute=context.createGain();mute.gain.value=0;
  const analysers=[0,1].map(channel=>{const analyser=context.createAnalyser();analyser.fftSize=4096;connect.call(splitter,analyser,channel);connect.call(analyser,mute);return analyser;});
  connect.call(this,splitter);connect.call(mute,destination);meters.push({label,context,mute,analysers,peak:0,acRms:0,frequency:0,channelDifference:0,current:null});return destination;
 };
 function sample(){
  for(const meter of meters){if(meter.context.state!=='running')continue;
   const pcm=meter.analysers.map(analyser=>{const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);return values;});
   let sum=0,squares=0,peak=0,difference=0,finite=true;for(let i=0;i<pcm[0].length;i++){const value=pcm[0][i];sum+=value;squares+=value*value;peak=Math.max(peak,Math.abs(value),Math.abs(pcm[1][i]));difference=Math.max(difference,Math.abs(value-pcm[1][i]));finite&&=Number.isFinite(value)&&Number.isFinite(pcm[1][i]);}
   if(!finite)failures.push('Non-finite final PCM');const mean=sum/pcm[0].length,acRms=Math.sqrt(Math.max(0,squares/pcm[0].length-mean*mean)),crossings=[];
   for(let i=1;i<pcm[0].length;i++)if(pcm[0][i-1]<=mean&&pcm[0][i]>mean)crossings.push(i-1+(mean-pcm[0][i-1])/(pcm[0][i]-pcm[0][i-1]));
   const frequency=crossings.length>4?meter.context.sampleRate*(crossings.length-1)/(crossings.at(-1)-crossings[0]):0;
   meter.peak=Math.max(meter.peak,peak);meter.acRms=Math.max(meter.acRms,acRms);meter.channelDifference=Math.max(meter.channelDifference,difference);
   if(acRms>.001&&frequency)meter.frequency=frequency;meter.current={acRms,peak,frequency,mean,finite};
  }
 }
 setInterval(sample,20);
 window.__sidExamplesAudit={label(value){label=value;},read(){sample();return {failures:[...failures],contexts:contexts.map(value=>({label:value.label,state:value.context.state})),nodes:[...nodes],commands:[...commands],meters:meters.map(({label,context,mute,peak,acRms,frequency,channelDifference,current})=>({label,sampleRate:context.sampleRate,muted:mute.gain.value===0,peak,acRms,frequency,channelDifference,current}))};}};
}
async function bounded(task,label,timeout=15000){let timer;try{return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Timed out: '+label)),timeout);})]);}finally{clearTimeout(timer);}}
const evaluate=(page,fn,arg,label='browser audit')=>bounded(page.evaluate(fn,arg),label);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(page,predicate,label,timeout=20000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await predicate())return;await pause(30);}throw Error(label+'; status='+await page.locator('#status').textContent()+'; detail='+await page.locator('#detail').textContent());}
const audit=page=>evaluate(page,()=>__sidExamplesAudit.read());
const status=(page,value,timeout=20000)=>until(page,async()=>((await page.locator('#status').textContent())??'').startsWith(value),'Expected status '+value,timeout);
const closed=page=>until(page,async()=>(await audit(page)).contexts.every(context=>context.state==='closed'),'AudioContext leak');
function summary(value,label){
 assert.deepEqual(value.failures,[]);const meters=value.meters.filter(meter=>meter.label===label),nodes=value.nodes.filter(node=>node.label===label);
 assert(meters.length,'No final PCM captured for '+label);assert(meters.every(meter=>meter.muted),'Physical output was not muted');
 const peak=Math.max(...meters.map(value=>value.peak)),acRms=Math.max(...meters.map(value=>value.acRms));assert(peak<.99,'Clipped final PCM '+label);assert(acRms>.0005,'Silent/DC-only audio '+label);assert(meters.every(meter=>meter.channelDifference<1e-7),'SID mono stereo duplication '+label);
 assert.equal(nodes.length,1,'Exactly one dedicated SID per example');assert.equal(nodes[0].name,'tetorica-sid');assert(nodes[0].wasmBytes>1000);assert.deepEqual(nodes[0].magic,[0,97,115,109]);
 return {peak,acRms,model:nodes[0].model,frequency:meters.map(value=>value.frequency),physicalOutput:'muted after final gain'};
}
async function setRange(page,id,value){await evaluate(page,({id,value})=>{const input=document.getElementById(id);input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));},{id,value},'set '+id);}
async function checkPage(browser,base,browserName,kind,id){
 const page=await browser.newPage({serviceWorkers:'block'});page.setDefaultTimeout(15000);const errors=[],consoleErrors=[],failed=[],external=[],results=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
 const origin=new URL(base).origin;page.on('request',request=>{const url=new URL(request.url());if(url.origin!==origin&&!['blob:','data:'].includes(url.protocol))external.push(url.href);});
 await page.route('**/*',route=>{const url=new URL(route.request().url());return url.origin===origin||['blob:','data:'].includes(url.protocol)?route.continue():route.abort();});
 await page.addInitScript(installAudit);
 try{
  await page.goto(base+'examples/'+id+'/web/index.html');await status(page,'Ready.');assert.deepEqual((await audit(page)).contexts,[],'Opening the example must not start audio');
  assert.equal(await page.locator('#model').inputValue(),'6581');
  for(const model of ['6581','8580']){
   const label=kind+'/'+model;console.log('CHECK '+browserName+'/'+label+': actual UI, dedicated SID, PCM and cleanup');
   await page.selectOption('#model',model);await evaluate(page,label=>__sidExamplesAudit.label(label),label);await page.click('#play');await status(page,'Playing');
   assert.equal(await page.locator('#model').isDisabled(),true,'Model stays fixed during playback');assert.equal(await page.locator('#stop').isEnabled(),true);
   await until(page,async()=>(await audit(page)).meters.some(meter=>meter.label===label&&meter.acRms>.0005),'Sustained final AC PCM');
   if(kind==='voices'){
    await until(page,async()=>(await audit(page)).meters.some(meter=>meter.label===label&&meter.current?.acRms>.0005&&Math.abs(meter.current.frequency-440)<6),'CH 1 triangle A4 near 440 Hz',1500);
    await status(page,'Finished.',12000);await closed(page);const value=await audit(page);results.push({model,finished:true,...summary(value,label)});
    const writes=value.commands.filter(command=>command.label===label);for(let channel=0;channel<3;channel++)assert(writes.some(write=>write.register===channel*7+4&&(write.value&1)),'Physical CH '+(channel+1)+' never gated');
   }else{
    await setRange(page,'cutoff',2047);await pause(180);let value=await audit(page);const wide=value.meters.findLast(meter=>meter.label===label).current.acRms;assert(wide>.0005,'Open LP must retain the saw chord');
    await setRange(page,'cutoff',0);await pause(220);value=await audit(page);const narrow=value.meters.findLast(meter=>meter.label===label).current.acRms;assert(narrow<wide*.5,'Closed LP must audibly attenuate the chord');
    await setRange(page,'cutoff',700);await setRange(page,'resonance',10);await page.check('#bandpass');await page.check('#highpass');await pause(120);
    value=await audit(page);const modes=value.commands.filter(command=>command.label===label&&command.register===24);assert(modes.some(write=>((write.value>>4)&7)===7),'LP/BP/HP outputs can be combined');
    for(const mode of ['lowpass','bandpass','highpass'])await page.uncheck('#'+mode);await pause(120);value=await audit(page);
    const controls=value.commands.filter(command=>command.label===label);assert(controls.some(write=>write.register===23&&(write.value&7)===0),'All filter outputs off must select dry routing');
    assert(controls.some(write=>write.register===23&&(write.value>>4)===10),'Live resonance reaches shared hardware register');
    await page.click('#stop');await status(page,'Stopped.');await closed(page);results.push({model,stopped:true,wideRms:wide,narrowRms:narrow,...summary(await audit(page),label)});
   }
   assert.equal(await page.locator('#model').isEnabled(),true);assert.equal(await page.locator('#play').isEnabled(),true);assert.equal(await page.locator('#stop').isEnabled(),false);
  }
  // Explicit Stop of a fresh run and a model change remain lazy and leak-free.
  const label=kind+'/stop-restart';await evaluate(page,label=>__sidExamplesAudit.label(label),label);await page.click('#play');await status(page,'Playing');await page.click('#stop');await status(page,'Stopped.');await closed(page);
  const before=(await audit(page)).contexts.length;await page.selectOption('#model','6581');assert.equal((await audit(page)).contexts.length,before,'Changing model while stopped must not start audio');
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);return {browser:browserName,example:id,results,lazyModelChange:true,stopClosesContexts:true};
 }catch(error){console.error(JSON.stringify({browser:browserName,kind,status:await page.locator('#status').textContent().catch(()=>null),errors,consoleErrors,failed,external,audit:await audit(page).catch(()=>null)}));throw error;}
 finally{await bounded(page.close(),'close SID page');}
}
try{
 const declared=JSON.parse(await readFile(join(repository,'package.json'),'utf8')).dependencies['tetorica-fm2612'];const installed=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8'));assert.equal(installed.version,declared,'Static vendor matches declared npm dependency');
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base='http://127.0.0.1:'+server.address().port+prefix,results=[];
 const browsers=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
 for(const[name,engine]of browsers){const browser=await bounded(engine.launch({headless:true}),'launch '+name,30000);try{for(const[kind,id]of Object.entries(cases))if(!selection||selection===kind)results.push(await checkPage(browser,base,name,kind,id));}finally{await bounded(browser.close(),'close '+name);}}
 assert.deepEqual(missing,[],'No source-tree/sibling fallback or missing static assets');
 for(const name of ['sid.js','sid8580.js','sidsynth.js','playground_sid_audio.js','playground_sid_worklet.js','generated/sid/sid.wasm','generated/sid8580-machine/sid8580-endpoint.wasm'])assert(served.has('vendor/tetorica-fm2612/'+name),'Actual vendor asset was used '+name);
 const receipt={schemaVersion:1,passed:true,physicalOutputMuted:true,listeningPerformed:false,staticSiteOnly:true,packageVersion:installed.version,results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)))};
 if(output){await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(receipt,null,2)+'\n');}
 console.log('PASS '+results.length+' SID example/browser cases: real AC PCM, both models, live shared filter, Stop/model lifecycle, static npm assets only');
}finally{server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}

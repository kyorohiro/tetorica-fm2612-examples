// SPDX-License-Identifier: BSD-3-Clause
// Real static-site lessons and published npm AudioWorklets. Every physical
// destination is permanently muted before any page or AudioContext is created.
import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
for(const arg of args)assert(/^--(?:site|sites|out|sample-rate|case)=.+$/.test(arg)||['--chromium','--webkit'].includes(arg),'Unknown argument '+arg);
assert(!(args.includes('--chromium')&&args.includes('--webkit')),'Choose one engine or omit both');
const option=(name,fallback)=>args.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3)??fallback;
const sites=option('sites',option('site','dist')).split(',').map(name=>resolve(repo,name));
assert(new Set(sites).size===sites.length,'Duplicate sites');
const sampleRate=Number(option('sample-rate','48000'));assert([44100,48000].includes(sampleRate),'Choose 44100 or 48000 Hz');
const output=resolve(repo,option('out','/private/tmp/tetorica-dmg-sid-timed-20261121/browser.json'));
const packageVersion=JSON.parse(await readFile(join(repo,'package.json'),'utf8')).dependencies['tetorica-fm2612'];
assert(/^\d+\.\d+\.\d+$/.test(packageVersion),'The tested npm dependency must be pinned exactly');
const prefix='/published-examples/',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.md':'text/plain'};
const lessons=[{kind:'dmg',id:'gameboy/registers/01-timed-operations',method:'gameboyTimed',models:[null],
  names:['dmg-pulse','dmg-wave','dmg-noise'],periods:[.5,.75,.25]},
 {kind:'sid',id:'c64/sid/04-timed-motion',method:'sidTimed',models:['6581','8580'],
  names:['melody','pulse-motion','filter-motion'],periods:[.6,2,3]}];
const selection=option('case','all'),selected=lessons.filter(item=>selection==='all'||selection===item.kind||selection===item.id);
assert(selected.length,'Unknown lesson');

function installAudit({sampleRate}){
 const Context=window.AudioContext??window.webkitAudioContext,Worklet=window.AudioWorkletNode;
 const connect=AudioNode.prototype.connect,post=MessagePort.prototype.postMessage;
 const contexts=[],nodes=[],meters=[],traffic=[],receipts=[],ports=new Map(),rejections=[];let label='cold',sequence=0;
 window.AudioContext=class extends Context{constructor(options={}){super({...options,sampleRate});contexts.push({context:this,label});}};
 if(window.webkitAudioContext)window.webkitAudioContext=window.AudioContext;
 window.AudioWorkletNode=class extends Worklet{constructor(context,name,options){super(context,name,options);nodes.push({name,model:options?.processorOptions?.model,label});}};
 AudioNode.prototype.connect=function(destination,...rest){
  if(destination!==this.context.destination)return connect.call(this,destination,...rest);
  const analyser=this.context.createAnalyser(),mute=this.context.createGain();analyser.fftSize=4096;mute.gain.value=0;
  connect.call(this,analyser);connect.call(analyser,mute);connect.call(mute,destination);
  meters.push({analyser,mute,context:this.context,label,peak:0,acRms:0,finite:true});return destination;
 };
 MessagePort.prototype.postMessage=function(data,...rest){
  if(['gameboyTimed','sidTimed'].includes(data?.method)){
   const payload=structuredClone(data.args[0]),entry={method:data.method,label,...payload};
   traffic.push(entry);ports.set(data.method,this);
   if(data.id!==undefined){const port=this,receive=event=>{
    if(event.data?.id!==data.id)return;port.removeEventListener('message',receive);
    receipts.push({method:data.method,label:entry.label,action:payload.action,name:payload.options?.name,ok:!event.data.error,value:event.data.value,error:event.data.error});
   };port.addEventListener('message',receive);port.start();}
  }
  return post.call(this,data,...rest);
 };
 window.addEventListener('unhandledrejection',event=>rejections.push(String(event.reason?.stack??event.reason)));
 function sample(){
  for(const meter of meters){if(meter.context.state!=='running')continue;
   const values=new Float32Array(meter.analyser.fftSize);meter.analyser.getFloatTimeDomainData(values);let sum=0,square=0;
   for(const value of values){meter.finite&&=Number.isFinite(value);meter.peak=Math.max(meter.peak,Math.abs(value));sum+=value;square+=value*value;}
   meter.acRms=Math.max(meter.acRms,Math.sqrt(Math.max(0,square/values.length-(sum/values.length)**2)));
  }
 }
 window.__dmgSidTimedAudit={label(value){label=value;},read(){sample();return{
  contexts:contexts.map(({context,label})=>({label,state:context.state,sampleRate:context.sampleRate})),nodes:[...nodes],
  meters:meters.map(({label,mute,peak,acRms,finite})=>({label,peak,acRms,finite,muted:mute.gain.value===0})),
  traffic:[...traffic],receipts:[...receipts],rejections:[...rejections]};},
  capture(method){return new Promise((resolve,reject)=>{
   const port=ports.get(method);if(!port){reject(Error('No timed client for '+method));return;}
   const id='lesson-audit:'+ ++sequence,timer=setTimeout(()=>{port.removeEventListener('message',receive);reject(Error('Capture timed out'));},5000);
   function receive({data}){if(data?.id!==id)return;clearTimeout(timer);port.removeEventListener('message',receive);data.error?reject(Error(data.error)):resolve(data.value);}
   port.addEventListener('message',receive);port.start();port.postMessage({id,method,args:[{action:'capture'}]});
  });}
 };
 setInterval(sample,10);
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label,timeout=20000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await check())return;await pause(25);}throw Error('Timed out: '+label);}
const audit=page=>page.evaluate(()=>__dmgSidTimedAudit.read());
const closed=page=>until(async()=>(await audit(page)).contexts.every(context=>context.state==='closed'),'all contexts closed');
const status=(page,text)=>until(()=>page.locator('#status').textContent().then(value=>value.startsWith(text)),'status '+text);
const unique=values=>new Set(values).size;

async function checkLesson(browser,engine,base,lesson,site){
 const page=await browser.newPage({viewport:{width:1360,height:1050},serviceWorkers:'block'}),errors=[],consoleErrors=[],missing=[],external=[];
 page.setDefaultTimeout(20000);await page.addInitScript(installAudit,{sampleRate});
 page.on('pageerror',error=>errors.push(error.stack??error.message));
 page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
 page.on('response',response=>{if(response.status()>=400)missing.push({url:response.url(),status:response.status()});});
 const origin=new URL(base).origin;
 await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===origin||['blob:','data:'].includes(url.protocol))return route.continue();external.push(url.href);return route.abort();});
 const result={site:relative(repo,site),engine,lesson:lesson.id,sampleRate,runs:[]};
 try{
  await page.goto(base+'examples/'+lesson.id+'/web/index.html');await status(page,'Ready.');
  assert.equal((await audit(page)).contexts.length,0,'Cold page does not create audio');
  const original=await page.locator('#code').inputValue();assert(original.length>300,'Readable editable lesson program');
  await until(()=>page.locator('[data-source]').first().textContent().then(text=>text.length>1000&&!text.startsWith('Loading')),'full source view');
  // Parse invalid source before creating or fetching an audio endpoint.
  await page.locator('#code').fill('const broken = ;');await page.click('#play');await status(page,'Error:');
  assert.equal((await audit(page)).contexts.length,0,'Syntax failure creates no audio');
  for(const model of lesson.models){
   const label=lesson.kind+'/'+(model??'dmg')+'/initial';
   if(model)await page.selectOption('#model',model);
   await page.locator('#code').fill(original);await page.evaluate(value=>__dmgSidTimedAudit.label(value),label);
   await page.click('#play');await status(page,'Playing');
   await until(async()=>{const current=await audit(page);return lesson.names.every(name=>current.receipts.some(item=>item.label===label&&item.action==='schedule'&&item.name===name&&item.ok));},'three reservations');
   const samples=[];
   for(let index=0;index<13;index++){samples.push(await page.evaluate(method=>__dmgSidTimedAudit.capture(method),lesson.method));if(index<12)await page.waitForTimeout(140);}
   assert(samples.at(-1).frame>samples[0].frame,'Actual renderer advances');
   assert.equal(await page.locator('#traceBody tr').count()>0,true,'Structured register rows are displayed');
   const values=samples.map(value=>value.state.registers);
   if(lesson.kind==='dmg'){
    assert(unique(values.map(bytes=>bytes[1]>>6))>1,'Pulse duty changes on its own pattern');
    assert(unique(values.map(bytes=>JSON.stringify(bytes.slice(32,48))))>1,'Wave RAM changes on its own pattern');
    assert(unique(values.map(bytes=>bytes[18]))>1,'Noise clock/width changes on its own pattern');
   }else{
    assert(samples.every(value=>value.state.model===model),'Captured selected model');
    assert(unique(values.map(bytes=>bytes[0]|bytes[1]<<8))>1,'Faster melody frequencies change');
    assert(unique(values.map(bytes=>bytes[2]|(bytes[3]&15)<<8))>1,'Independent pulse-width pattern changes');
    assert(unique(values.map(bytes=>(bytes[21]&7)|bytes[22]<<3))>1,'Independent shared-filter pattern changes');
   }
   const current=await audit(page),reservations=current.receipts.filter(item=>item.label===label&&item.action==='schedule'&&item.ok);
   for(let index=0;index<lesson.names.length;index++){
    const receipt=reservations.find(item=>item.name===lesson.names[index]);assert.equal(receipt.value.repeatSeconds,lesson.periods[index]);
   }
   assert(current.meters.some(meter=>meter.label===label&&meter.acRms>.0001),'Nonzero real AC PCM before permanent mute');
   const details=await page.locator('#detail').textContent();assert(details.includes('"snapshotUnchanged":true'),'Snapshot comparison passes');
   if(lesson.kind==='dmg')assert(details.includes('"liveUnchanged":true'),'DMG compilation leaves live registers unchanged');
   if(result.runs.length===0){
    const screenshot=output.replace(/\.json$/,`-${relative(repo,site).replaceAll('/','-')}-${engine}-${lesson.kind}-desktop.png`);
    await mkdir(dirname(screenshot),{recursive:true});await page.screenshot({path:screenshot,fullPage:true});result.desktopScreenshot=screenshot;
   }
   await page.click('#stop');await status(page,'Stopped.');await closed(page);
   const count=(await audit(page)).traffic.filter(item=>item.action==='schedule').length;await page.waitForTimeout(100);
   assert.equal((await audit(page)).traffic.filter(item=>item.action==='schedule').length,count,'Stop prevents late reservations');
   result.runs.push({model:model??'dmg',sampleFrames:samples.map(value=>value.frame),periods:reservations.map(item=>({name:item.name,repeatSeconds:item.value.repeatSeconds})),observedRegisterChanges:true});
  }
  // Changes in the textarea apply to the next Play. BPM affects musical wait,
  // while the Worklet reservation periods stay explicit seconds.
  const edited='console.log("EDITED_DMG_SID_EXAMPLE");\n'+original.replace(/setBpm\(\s*120\s*\)/,'setBpm(240)');
  await page.locator('#code').fill(edited);await page.evaluate(()=>__dmgSidTimedAudit.label('edited'));await page.click('#play');
  await until(()=>page.locator('#detail').textContent().then(value=>value.includes('EDITED_DMG_SID_EXAMPLE')),'edited program ran');
  await status(page,'Finished.');await closed(page);
  const editedReceipts=(await audit(page)).receipts.filter(item=>item.label==='edited'&&item.action==='schedule'&&item.ok);
  assert.equal(editedReceipts.length,3);for(let i=0;i<3;i++)assert.equal(editedReceipts.find(item=>item.name===lesson.names[i]).value.repeatSeconds,lesson.periods[i]);
  // A runtime exception retires the actual context and does not poison restart.
  await page.locator('#code').fill('throw new Error("INTENTIONAL_LESSON_FAILURE");');await page.click('#play');await status(page,'Error:');await closed(page);
  assert((await page.locator('#status').textContent()).includes('INTENTIONAL_LESSON_FAILURE'));
  // Hold the real WASM fetch. Stop must close promptly; completing the old
  // request may not revive the old run or schedule notes into a newer one.
  let intercepted=false,release;const barrier=new Promise(resolve=>release=resolve);
  const hold=async route=>{intercepted=true;await barrier;try{await route.continue();}catch{}};
  await page.route('**/*.wasm',hold);await page.locator('#code').fill(original);await page.click('#play');
  await until(()=>intercepted,'real WASM fetch intercepted');await page.click('#stop');release();
  await status(page,'Stopped.');await closed(page);await page.unroute('**/*.wasm',hold);await page.waitForTimeout(120);await closed(page);
  await page.locator('#code').fill('console.log("RESTART_AFTER_CANCEL");\n'+original);await page.click('#play');await status(page,'Playing');
  await until(()=>page.locator('#detail').textContent().then(value=>value.includes('RESTART_AFTER_CANCEL')),'restart after cancellation');
  await page.click('#stop');await status(page,'Stopped.');await closed(page);
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px page does not overflow');
  const screenshot=output.replace(/\.json$/,`-${relative(repo,site).replaceAll('/','-')}-${engine}-${lesson.kind}-390.png`);
  await mkdir(dirname(screenshot),{recursive:true});await page.screenshot({path:screenshot,fullPage:true});
  const final=await audit(page);assert(final.contexts.every(context=>context.state==='closed'));assert(final.contexts.every(context=>context.sampleRate===sampleRate));
  assert(final.meters.length>0&&final.meters.every(meter=>meter.muted&&meter.finite&&meter.peak<1),'Every destination permanently muted and finite');
  assert.deepEqual(final.rejections,[]);assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);
  return{...result,passed:true,editedSource:true,syntaxFailureBeforeAudio:true,runtimeFailureCleaned:true,pendingInitializationCancelled:true,restartAfterCancel:true,narrowLayout:true,screenshot,audit:final};
 }catch(error){throw Object.assign(error,{caseResult:{...result,passed:false,error:error.stack??String(error),status:await page.locator('#status').textContent().catch(()=>null),detail:await page.locator('#detail').textContent().catch(()=>null),audit:await audit(page).catch(()=>null),errors,consoleErrors,missing,external}});}
 finally{await page.close();}
}

let failure;const results=[],assets={};
for(const site of sites){
 if(failure)break;
 const served=new Map(),missing=[];
 const server=http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
   assert(pathname.startsWith(prefix),'Request escaped static prefix');let file=resolve(site,pathname.slice(prefix.length));
   assert(file.startsWith(site+sep),'Request escaped static root');if((await stat(file)).isDirectory())file=join(file,'index.html');
   const bytes=await readFile(file),name=relative(site,file).split(sep).join('/'),record={bytes:bytes.length,sha256:hash(bytes)};
   if(served.has(name))assert.deepEqual(served.get(name),record,'Asset changed during verification: '+name);served.set(name,record);
   res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','cache-control':'no-store'}).end(bytes);
  }catch(error){missing.push({url:req.url,error:error.message});res.writeHead(404).end(error.message);}
 });
 try{
  const version=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8')).version;assert.equal(version,packageVersion);
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base='http://127.0.0.1:'+server.address().port+prefix;
  const engines=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
  for(const[name,engine]of engines){
   const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio','--autoplay-policy=no-user-gesture-required']}:{})});
   try{for(const lesson of selected){results.push(await checkLesson(browser,name,base,lesson,site));console.log('PASS '+relative(repo,site)+'/'+name+'/'+lesson.kind+' (permanent physical mute)');}}
   finally{await browser.close();}
  }
  assert.deepEqual(missing,[]);
  for(const[name,record]of served){
   const final=await readFile(join(site,name));assert.deepEqual({bytes:final.length,sha256:hash(final)},record,'Final file still matches tested bytes');
   const source=name.startsWith('vendor/tetorica-fm2612/')?join(repo,'node_modules/tetorica-fm2612',name.slice('vendor/tetorica-fm2612/'.length))
    :name.startsWith('examples/')?join(repo,name):join(repo,'public',name);
   const original=await readFile(source);assert.deepEqual({bytes:original.length,sha256:hash(original)},record,'Published asset matches its source: '+name);
  }
  assets[relative(repo,site)]=Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)));
 }catch(error){failure=error;if(error.caseResult)results.push(error.caseResult);}
 finally{server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}
}
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify({schemaVersion:1,passed:!failure,packageVersion,sampleRate,physicalOutputMuted:true,listeningPerformed:false,staticSiteOnly:true,results,assets},null,2)+'\n');
if(failure)throw failure;
console.log('PASS DMG/SID timed lessons: '+results.length+' cases; '+output);

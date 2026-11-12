// Published npm VAB helpers and an actual SPU AudioWorklet, physically muted.
// No game assets, repository runtime fallback, microphone or ordinary browser.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import http from 'node:http';
import {chromium,webkit} from 'playwright';
import {readVab,prepareVabTone,exportVab} from 'tetorica-fm2612/ps1_vab.js';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
for(const arg of args)assert(/^(--(?:root|out)=.+|--chromium|--webkit)$/.test(arg),'Unknown option '+arg);
assert(!(args.includes('--chromium')&&args.includes('--webkit')),'Choose one browser or neither');
const option=name=>args.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
const site=resolve(repo,option('root')??'dist'),output=resolve(option('out')??'/private/tmp/tetorica-vab-examples-browser.json');
const prefix='/vab-examples/',id='ps1/spu/03-vab-bank',served=new Map(),missing=[],results=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const source=await readFile(join(repo,'examples',id,'assets/demo.vab')),bank=readVab(source),expected=prepareVabTone(bank,1);
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  assert(pathname.startsWith(prefix),'Outside nested example prefix');let file=resolve(site,pathname.slice(prefix.length)),local=relative(site,file);
  assert(local!=='..'&&!local.startsWith('..'+sep)&&!local.startsWith(sep),'Outside static site');
  if((await stat(file)).isDirectory())file=join(file,'index.html');const bytes=await readFile(file),name=relative(site,file).split(sep).join('/'),sha256=sha(bytes);
  if(served.has(name))assert.equal(served.get(name).sha256,sha256,'Source changed while checking '+name);served.set(name,{bytes:bytes.length,sha256});
  res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','cache-control':'no-store'}).end(bytes);
}catch(error){missing.push({url:req.url,error:error.message});res.writeHead(404).end(error.message);}});

// Installed before any example script: every destination path includes a zero
// gain. Metering observes actual upstream PCM; no synthetic AudioBuffer is used.
function installSilentAudit(){
  const contexts=[],nodes=[],commands=[],samples=[],meters=[],failures=[],fetches=[];
  const Context=window.AudioContext??window.webkitAudioContext,Worklet=window.AudioWorkletNode;
  const connect=AudioNode.prototype.connect,post=MessagePort.prototype.postMessage,nativeFetch=window.fetch;
  const labels=new WeakMap(),pending=new WeakMap();
  window.fetch=function(...args){fetches.push(String(args[0]));return nativeFetch.apply(this,args);};
  window.AudioContext=new Proxy(Context,{construct(Target,args){const context=Reflect.construct(Target,args);contexts.push(context);return context;}});
  if(window.webkitAudioContext===Context)window.webkitAudioContext=window.AudioContext;
  window.AudioWorkletNode=new Proxy(Worklet,{construct(Target,args){const node=Reflect.construct(Target,args);nodes.push({name:args[1]});labels.set(node.port,args[1]);
    node.addEventListener('processorerror',()=>failures.push(args[1]));node.port.addEventListener('message',({data})=>{
      const method=pending.get(node.port)?.get(data?.id);pending.get(node.port)?.delete(data?.id);
      if(method==='loadADPCM'&&data.value)samples.push(structuredClone(data.value));
    });return node;}});
  MessagePort.prototype.postMessage=function(data,...rest){
    if(data?.method){let requests=pending.get(this);if(!requests)pending.set(this,requests=new Map());requests.set(data.id,data.method);
      if(['loadADPCM','setPreset','setReverb','noteOn','keyOff','allNotesOff'].includes(data.method))commands.push({name:labels.get(this),method:data.method,args:structuredClone(data.args)});
    }return post.call(this,data,...rest);
  };
  AudioNode.prototype.connect=function(destination,...rest){
    if(destination!==this.context.destination)return connect.call(this,destination,...rest);
    const analyser=this.context.createAnalyser(),mute=this.context.createGain();analyser.fftSize=4096;mute.gain.value=0;
    connect.call(this,analyser,...rest);connect.call(analyser,mute);connect.call(mute,destination);
    meters.push({context:this.context,analyser,mute,peak:0,rms:0,current:{peak:0,rms:0}});return destination;
  };
  function sample(){for(const meter of meters){if(meter.context.state!=='running'){meter.current={peak:0,rms:0};continue;}
    const values=new Float32Array(meter.analyser.fftSize);meter.analyser.getFloatTimeDomainData(values);let peak=0,square=0;
    for(const value of values){if(!Number.isFinite(value))failures.push('Non-finite PCM');peak=Math.max(peak,Math.abs(value));square+=value*value;}
    const rms=Math.sqrt(square/values.length);meter.peak=Math.max(meter.peak,peak);meter.rms=Math.max(meter.rms,rms);meter.current={peak,rms};
  }}
  const timer=setInterval(sample,20);window.addEventListener('pagehide',()=>clearInterval(timer));
  window.__vabExampleAudit={read(){sample();return{contexts:contexts.map(context=>context.state),nodes:[...nodes],commands:structuredClone(commands),samples:structuredClone(samples),failures:[...failures],fetches:[...fetches],
    meters:meters.map(({context,mute,peak,rms,current})=>({state:context.state,muted:mute.gain.value===0,peak,rms,current}))};}};
}
const audit=page=>page.evaluate(()=>__vabExampleAudit.read());
const metadata=page=>page.locator('#detail').textContent().then(text=>{try{return JSON.parse(text);}catch{return{};}});
async function until(page,predicate,label,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){if(await predicate())return;await pause(25);}throw Error(label+'; '+await page.locator('#status').textContent()+'; '+await page.locator('#audio-status').textContent());}
const closed=page=>until(page,async()=>(await audit(page)).contexts.every(state=>state==='closed'),'Every AudioContext closed');
async function localFile(page,bytes,name){const chooser=page.waitForEvent('filechooser');await page.click('#load-local');await(await chooser).setFiles({name,mimeType:'application/octet-stream',buffer:Buffer.from(bytes)});await until(page,async()=>await page.locator('body').getAttribute('data-loading')==='false','Local read settled');}
async function checkPage(browser,name,base){
  const page=await browser.newPage({serviceWorkers:'block',viewport:{width:1360,height:1050}});page.setDefaultTimeout(15000);
  const errors=[],consoleErrors=[],badResponses=[],external=[];page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack}));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400)badResponses.push(response.url());});
  const origin=new URL(base).origin;await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin&&!['blob:','data:'].includes(url.protocol)){external.push(url.href);return route.abort('blockedbyclient');}return route.continue();});
  await page.addInitScript(installSilentAudit);
  try{
    console.log('CHECK '+name+': VAB bank Web example');await page.goto(base+'examples/'+id+'/web/index.html');await page.waitForFunction(()=>document.body.dataset.bankLoaded==='false');
    assert.deepEqual((await audit(page)).contexts,[]);assert.deepEqual((await audit(page)).fetches,[],'No explicit fetch on page load');
    assert.equal(await page.locator('#play').isDisabled(),true);await page.click('#load-demo');
    await until(page,async()=>(await metadata(page)).bank==='demo.vab','Demo bank loaded');
    assert.deepEqual(await page.locator('#program option').evaluateAll(options=>options.map(option=>option.value)),['3','11'],'Sparse Program numbers remain original');
    assert.deepEqual((await audit(page)).contexts,[],'Loading and selecting never starts audio');
    await page.selectOption('#program','11');let detail=await metadata(page);assert.equal(detail.tone,0);assert.equal(detail.toneNumber,2);assert.equal(detail.sample,2);assert.equal(detail.adpcmBytes,16);assert.equal(detail.baseFrequencyHz,440);assert.equal(detail.loopStartSamples,null);
    await page.selectOption('#program','3');await page.selectOption('#tone','1');detail=await metadata(page);
    assert.equal(detail.tone,1);assert.equal(detail.adpcmBytes,64);assert.equal(detail.sourceSampleBytes,80);assert.equal(detail.trimmedBytes,16);assert.equal(detail.baseFrequencyHz,expected.options.baseFrequencyHz);assert.equal(detail.loopStartSamples,0);
    const retained=detail;await localFile(page,Uint8Array.of(1,2,3),'invalid.vab');assert.match(await page.locator('#status').textContent(),/Load failed:.*Previous bank and selection kept/);assert.deepEqual(await metadata(page),retained);
    const cancelled=page.waitForEvent('filechooser');await page.click('#load-local');await(await cancelled).setFiles([]);await pause(30);assert.deepEqual(await metadata(page),retained);assert.deepEqual((await audit(page)).contexts,[]);
    const partial=Buffer.from(source);partial.writeUInt16LE(255,0x840+22);await localFile(page,partial,'partial.vab');
    const unavailable=await page.locator('#tone option[value="1"]').evaluate(option=>({disabled:option.disabled,text:option.textContent}));assert(unavailable.disabled);assert.match(unavailable.text,/unavailable:.*Noise/i);
    // An older delayed demo read cannot replace a newer local source.
    let held=false,release;const gate=new Promise(resolve=>{release=resolve;});
    await page.route('**/assets/demo.vab',async route=>{held=true;await gate;try{await route.continue();}catch{/* Latest read deliberately aborted this older fetch. */}});
    try{await page.click('#load-demo');await until(page,async()=>held,'Held demo read');await localFile(page,source,'local-kept.vab');release();await pause(80);assert.equal((await metadata(page)).bank,'local-kept.vab');}
    finally{release();await page.unroute('**/assets/demo.vab');}
    await page.selectOption('#tone','1');detail=await metadata(page);assert.equal(detail.tone,1);
    const download=page.waitForEvent('download');await page.click('#export-tone');const item=await download,chunks=[];for await(const chunk of await item.createReadStream())chunks.push(chunk);
    const bytes=Buffer.concat(chunks),one=readVab(bytes);assert.deepEqual(bytes,Buffer.from(exportVab(bank,{toneNumber:1})));assert.equal(one.tones.length,1);assert.equal(one.tones[0].program,3);assert.equal(one.tones[0].index,0);assert.equal(one.tones[0].sample,1);assert.deepEqual(one.samples[0].bytes,bank.samples[0].bytes);
    assert.deepEqual((await audit(page)).contexts,[],'Export is also audio-free');
    const before=await audit(page);await page.click('#play');
    await until(page,async()=>{const a=await audit(page);return a.commands.slice(before.commands.length).some(command=>command.method==='setPreset')&&a.meters.some(m=>m.peak>.001);},'Actual original Tone PCM');
    await until(page,async()=>await page.locator('#audio-status').textContent()==='Finished.','Short note completed');await closed(page);
    let a=await audit(page);const commands=a.commands.slice(before.commands.length),load=commands.find(c=>c.method==='loadADPCM'),preset=commands.find(c=>c.method==='setPreset');
    // createPs1Audio uses a dedicated MessageChannel, not node.port. The
    // uploaded descriptor is the real loadADPCM reply passed into setPreset.
    const uploaded=preset.args[1].sample;
    assert.deepEqual(Array.from(load.args[0]),Array.from(expected.adpcm));assert.deepEqual(load.args[1],expected.options);assert.equal(uploaded.byteLength,64);assert.equal(uploaded.decodedFrames,112);assert.equal(uploaded.rootFrequencyHz,expected.options.baseFrequencyHz);assert.equal(uploaded.loop,true);assert.equal(uploaded.loopStartSamples,0);
    for(const key of ['adsr1','adsr2','pitch','reverb','volumeLeft','volumeRight'])assert.equal(preset.args[1][key],expected.preset[key],key+' stays source-authored');
    assert(commands.some(c=>c.method==='setReverb'&&c.args[0].preset==='off'));assert(commands.some(c=>c.method==='keyOff'));assert(a.meters.every(m=>m.muted&&m.peak<.95));
    const defaultCode=await page.locator('#code').inputValue();await page.locator('#code').fill(defaultCode.replace('sleep(0.6)','sleep(60)'));
    const meterCount=a.meters.length;await page.click('#play');await until(page,async()=>(await audit(page)).meters.slice(meterCount).some(m=>m.current.rms>.001),'Held Tone before Stop');await page.click('#stop');
    await until(page,async()=>await page.locator('#audio-status').textContent()==='Stopped.','Explicit Stop');await closed(page);assert.deepEqual(await metadata(page),detail);
    // Stop also retires an endpoint whose WASM initialization finishes late.
    let wasmHeld=false,releaseWasm;const wasmGate=new Promise(resolve=>{releaseWasm=resolve;});
    await page.route('**/ps1_spu_wasm.wasm',async route=>{wasmHeld=true;await wasmGate;try{await route.continue();}catch{/* Stop cancelled this fetch. */}});
    try{await page.click('#play');await until(page,async()=>wasmHeld,'Held WASM initialization');await page.click('#stop');await until(page,async()=>await page.locator('#audio-status').textContent()==='Stopped.','Stop during init');await closed(page);releaseWasm();await pause(80);await closed(page);}
    finally{releaseWasm();await page.unroute('**/ps1_spu_wasm.wasm');}
    await page.click('#play');await until(page,async()=>(await audit(page)).contexts.some(state=>state==='running'),'Pagehide active context');
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await closed(page);a=await audit(page);
    assert.deepEqual(a.failures,[]);assert(a.meters.every(m=>m.muted&&m.current.peak===0));assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(external,[]);
    const screenshot=output.replace(/\.json$/,'')+'-'+name+'.png';await mkdir(dirname(screenshot),{recursive:true});await page.screenshot({path:screenshot,fullPage:true});
    return{browser:name,version:browser.version(),sparsePrograms:[3,11],sourceBytes:source.length,selectedTone:1,prepared:expected.options,download:{name:item.suggestedFilename(),bytes:bytes.length,sha256:sha(bytes)},
      sourceAndSelectionKept:true,unavailableReason:true,staleReadDiscarded:true,noAutomaticAudioOrFetch:true,allContextsClosed:true,stopDuringLoading:true,pagehideCleanup:true,uploaded,meters:a.meters,screenshot};
  }catch(error){console.error(JSON.stringify({browser:name,errors,consoleErrors,badResponses,external,audit:await audit(page).catch(()=>null)}));throw error;}
  finally{await page.close();}
}

let failure;
try{
  const dependency=JSON.parse(await readFile(join(repo,'package.json'),'utf8')).dependencies['tetorica-fm2612'];
  const vendor=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8'));assert.equal(vendor.version,dependency);assert.equal(vendor.version,'0.2.40');
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base='http://127.0.0.1:'+server.address().port+prefix;
  const engines=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
  for(const[name,engine]of engines){const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio','--autoplay-policy=no-user-gesture-required']}:{})});try{results.push(await checkPage(browser,name,base));console.log('PASS '+name+' VAB example (physical gain0)');}finally{await browser.close();}}
  assert.deepEqual(missing,[]);for(const[name,item]of served)assert.equal(sha(await readFile(join(site,name))),item.sha256,'Frozen static-site source '+name);
  for(const asset of ['ps1_vab.js','playground_ps1_audio.js','playground_ps1.js','playground_ps1_worklet.js','generated/ps1_spu_wasm.wasm'])assert(served.has('vendor/tetorica-fm2612/'+asset),'Used published asset '+asset);
}catch(error){failure=error;}
finally{
  server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));
  await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify({schemaVersion:1,passed:!failure,packageVersion:'0.2.40',physicalOutputMuted:true,listeningPerformed:false,staticSiteOnly:true,
    results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b))),...(failure?{error:failure.stack??String(failure)}:{})},null,2)+'\n');
}
if(failure)throw failure;console.log('PASS VAB Web example: source selection/export, native PCM and resource cleanup; '+output);

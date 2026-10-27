// Build first; only the complete static dist/docs tree is served under a subpath.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';

const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
const option=name=>args.find(value=>value.startsWith(`--${name}=`))?.slice(name.length+3);
for(const value of args)assert(/^(--(?:root|case|execution|out|images)=.+|--chromium|--webkit)$/.test(value),`Unknown argument: ${value}`);
const site=resolve(repository,option('root')??'dist'),receiptPath=option('out')?resolve(option('out')):null;
const images=resolve(option('images')??'/private/tmp/pcengine-cd-examples-visual');
const cases={cdda:'pc-engine-cd/cdda/01-stereo-tracks',adpcm:'pc-engine-cd/adpcm/01-sample',mix:'pc-engine-cd/mix/01-three-sources'};
const selectedCase=option('case'),execution=option('execution');
if(selectedCase)assert(Object.hasOwn(cases,selectedCase),'Unknown case: '+selectedCase);
if(execution)assert(['main','worker'].includes(execution),'Unknown execution: '+execution);
const engines=args.includes('--chromium')?{chromium}:args.includes('--webkit')?{webkit}:{chromium,webkit};
const prefix='/examples-site/',served=new Map(),missing=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
    assert(pathname.startsWith(prefix),'Request outside static site');
    let file=resolve(site,pathname.slice(prefix.length)),local=relative(site,file);
    assert(local!=='..'&&!local.startsWith('..'+sep)&&!local.startsWith(sep),'Request escaped site');
    if((await stat(file)).isDirectory())file=join(file,'index.html');
    const bytes=await readFile(file),name=relative(site,file).split(sep).join('/'),entry={bytes:bytes.length,sha256:sha(bytes)};
    if(served.has(name))assert.deepEqual(entry,served.get(name),'Source changed during check: '+name);
    served.set(name,entry);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
  }catch(error){missing.push(req.url);res.writeHead(404).end(String(error));}
});

function installOutputAudit(){
  let run='load',phase='unmarked',sequence=0;
  const contexts=[],nodes=[],commands=[],failures=[],contextInfo=new WeakMap(),nodeInfo=new WeakMap();
  const Context=window.AudioContext,Worklet=window.AudioWorkletNode;
  const connect=AudioNode.prototype.connect,disconnect=AudioNode.prototype.disconnect;
  const source=`class Capture extends AudioWorkletProcessor {
    constructor(options){super();this.phase=options.processorOptions.phase;this.offset=0;this.coeff=[110,220,330,440,660,880].map(f=>2*Math.cos(2*Math.PI*f/sampleRate));this.states=Array.from({length:2},()=>this.coeff.map(()=>[0,0]));this.port.onmessage=({data})=>{this.phase=data.phase;this.offset=0;for(const list of this.states)for(const state of list)state.fill(0);this.port.postMessage({ack:data.id});};}
    process(inputs,outputs){for(const channel of outputs[0])channel.fill(0);const channels=inputs[0]??[],count=outputs[0][0]?.length??128;
      let finite=true,peak=0,difference=0;const acRms=[],means=[];
      if(!this.offset)this.begin=currentTime;
      for(let ch=0;ch<2;ch++){const samples=channels[ch]??channels[0];let sum=0,square=0;
        for(let i=0;i<count;i++){const value=samples?.[i]??0;finite=finite&&Number.isFinite(value);peak=Math.max(peak,Math.abs(value));sum+=value;square+=value*value;
          for(let f=0;f<this.coeff.length;f++){const state=this.states[ch][f],next=value+this.coeff[f]*state[0]-state[1];state[1]=state[0];state[0]=next;}}
        means[ch]=sum/count;acRms[ch]=Math.sqrt(Math.max(0,square/count-means[ch]*means[ch]));}
      for(let i=0;i<count;i++)difference=Math.max(difference,Math.abs((channels[0]?.[i]??0)-(channels[1]?.[i]??channels[0]?.[i]??0)));
      this.offset+=count;let spectral;
      if(this.offset===4096){spectral={begin:this.begin,end:currentTime+count/sampleRate,bands:this.states.map(list=>list.map((state,i)=>2*Math.sqrt(Math.max(0,state[0]*state[0]+state[1]*state[1]-this.coeff[i]*state[0]*state[1]))/4096))};this.offset=0;for(const list of this.states)for(const state of list)state.fill(0);}
      this.port.postMessage({phase:this.phase,time:currentTime,frames:count,finite,peak,difference,acRms,mean:means,...(spectral?{spectral}:{})});return true;
    }
  }registerProcessor('pcengine-cd-final-audit',Capture);`;
  const moduleURL=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  function updatePhase(next){
    if(phase===next)return;phase=next;
    for(const info of contexts)if(info.run===run&&info.context.state!=='closed'){
      info.markers.push({phase,time:info.context.currentTime});
      if(info.capture)info.capture.port.postMessage({phase,id:++sequence});
    }
  }
  new MutationObserver(()=>{
    const text=document.getElementById('detail')?.textContent??'',markers=[...text.matchAll(/(?:PHASE_(?:CDDA|ADPCM|MIX)_[A-Z0-9_]+|AUDIT_[A-Z0-9_]+)/g)];
    updatePhase(markers.at(-1)?.[0]??'unmarked');
  }).observe(document,{childList:true,characterData:true,subtree:true});
  window.AudioContext=new Proxy(Context,{construct(Target,args){
    const context=Reflect.construct(Target,args),sink=context.createGain();sink.gain.value=0;connect.call(sink,context.destination);
    const info={context,run,blocks:[],markers:[],sink,pending:new Set(),closeRequests:0};contexts.push(info);contextInfo.set(context,info);
    const add=context.audioWorklet.addModule.bind(context.audioWorklet);
    info.ready=add(moduleURL).then(()=>{
      if(context.state==='closed')return;
      const capture=new Worklet(context,'pcengine-cd-final-audit',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2],channelCount:2,channelCountMode:'explicit',processorOptions:{phase}});
      info.capture=capture;capture.port.onmessage=({data})=>{if(data.ack===undefined)info.blocks.push(data);};
      capture.onprocessorerror=()=>failures.push('Capture processor failed');connect.call(capture,context.destination);
      for(const node of info.pending){try{disconnect.call(node,sink);}catch{}connect.call(node,capture);}info.pending.clear();
    }).catch(error=>{if(context.state!=='closed')failures.push(String(error));});
    context.audioWorklet.addModule=async(...args)=>{await info.ready;return add(...args);};
    const close=context.close.bind(context);context.close=(...args)=>{info.closeRequests++;return close(...args);};
    return context;
  }});
  if(window.webkitAudioContext===Context)window.webkitAudioContext=window.AudioContext;
  window.AudioWorkletNode=new Proxy(Worklet,{construct(Target,args){
    const node=Reflect.construct(Target,args),binary=args[2]?.processorOptions?.wasmBinary;
    const bytes=binary instanceof ArrayBuffer?new Uint8Array(binary):ArrayBuffer.isView(binary)?new Uint8Array(binary.buffer,binary.byteOffset,binary.byteLength):null;
    const info={id:++sequence,run,processor:args[1],wasmBytes:bytes?.length??0,wasmMagic:bytes?Array.from(bytes.subarray(0,4)):[],disconnects:0};nodes.push(info);nodeInfo.set(node,info);
    const post=node.port.postMessage.bind(node.port);node.port.postMessage=(data,...rest)=>{
      const action=data?.action??data,method=action?.type??action?.method;
      if(method)commands.push({run,node:info.id,processor:info.processor,time:node.context.currentTime,method,
        ...(action.data instanceof Uint8Array?{bytes:action.data.byteLength}:{}),...(action.pcm instanceof Uint8Array?{bytes:action.pcm.byteLength}:{}),
        ...(action.rate!==undefined?{rate:action.rate}:{}),...(action.offset!==undefined?{offset:action.offset}:{}),...(action.length!==undefined?{length:action.length}:{}),...(action.sourceFrame!==undefined?{sourceFrame:action.sourceFrame}:{})});
      return post(data,...rest);
    };return node;
  }});
  AudioNode.prototype.connect=function(destination,...args){
    if(destination!==this.context.destination)return connect.call(this,destination,...args);
    const info=contextInfo.get(this.context);if(!info)throw Error('Unknown output context');
    if(!info.capture)info.pending.add(this);connect.call(this,info.capture??info.sink,...args);return destination;
  };
  AudioNode.prototype.disconnect=function(...args){
    const info=contextInfo.get(this.context),node=nodeInfo.get(this);if(node)node.disconnects++;
    if(info&&(!args.length||args[0]===this.context.destination))info.pending.delete(this);
    if(info&&args[0]===this.context.destination)args[0]=info.capture??info.sink;
    return disconnect.call(this,...args);
  };
  window.__pcCdAudit={
    reset(label){run=label;phase='unmarked';},
    read(label=run){return {run:label,failures:[...failures],contexts:contexts.map(info=>({run:info.run,state:info.context.state,sampleRate:info.context.sampleRate,closeRequests:info.closeRequests})),
      nodes:nodes.filter(info=>info.run===label),commands:commands.filter(info=>info.run===label),
      meters:contexts.filter(info=>info.run===label).map(info=>({sampleRate:info.context.sampleRate,blocks:info.blocks,markers:info.markers}))};},
  };
}

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(page,predicate,message,timeout=25000){
  const end=Date.now()+timeout;while(Date.now()<end){if(await predicate())return;await pause(30);}
  throw Error(`${message};status=${await page.locator('#status').textContent()};detail=${await page.locator('#detail').textContent()}`);
}
const status=(page,text)=>until(page,async()=>(await page.locator('#status').textContent()).startsWith(text),'Expected '+text);
const audit=page=>page.evaluate(()=>window.__pcCdAudit.read());
const reset=(page,label)=>page.evaluate(label=>window.__pcCdAudit.reset(label),label);
const closed=page=>until(page,async()=>(await audit(page)).contexts.every(context=>context.state==='closed'),'Audio context leak');
async function controls(page,playing=false){assert.equal(await page.locator('#play').isEnabled(),!playing);assert.equal(await page.locator('#stop').isEnabled(),playing);assert.equal(await page.locator('#execution').isEnabled(),!playing);assert(await page.locator('#code').isEnabled());}
function summary(result,{audible=true,devices=[]}={}){
  assert.deepEqual(result.failures,[]);assert(result.contexts.every(context=>context.state==='closed'),'Unclosed AudioContext');
  const blocks=result.meters.flatMap(meter=>meter.blocks);assert(blocks.every(block=>block.finite),'Non-finite actual final PCM');
  const peak=Math.max(0,...blocks.map(block=>block.peak)),acRms=Math.max(0,...blocks.flatMap(block=>block.acRms));
  assert(peak<.99999,'Clipped actual final PCM: '+peak);if(audible)assert(acRms>.0005,'Silent/DC-only host output');else assert(peak<1e-7,'Cancelled/error setup produced audio');
  const names=result.nodes.map(node=>node.processor),allowed=['tetorica-huc6280','tetorica-native-fx','tetorica-cdda','tetorica-msm5205'];
  assert(names.every(name=>allowed.includes(name)),'Unexpected hidden source: '+names);
  for(const device of devices){const nodes=result.nodes.filter(node=>node.processor===device);assert.equal(nodes.length,1,'Exactly one '+device);
    assert(nodes[0].wasmBytes>1000,'Missing real WASM '+device);assert.deepEqual(nodes[0].wasmMagic,[0,97,115,109]);assert(nodes[0].disconnects>0,'Source not disconnected '+device);}
  return {peak,acRms,frames:blocks.reduce((n,block)=>n+block.frames,0),contexts:result.contexts,nodes:result.nodes,physicalOutputMuted:true};
}
function phaseData(result,name,{after=.04,before=Infinity}={}){
  const blocks=[],windows=[];
  for(const meter of result.meters){
    const marker=meter.markers.find(marker=>marker.phase===name);assert(marker,'Missing marker '+name);
    const end=meter.markers.find(next=>next.time>marker.time&&next.phase!==name)?.time??Infinity;
    const start=marker.time+after,finish=Math.min(marker.time+before,end-.01);
    for(const block of meter.blocks)if(block.phase===name&&block.time>=start&&block.time+block.frames/meter.sampleRate<=finish){blocks.push(block);if(block.spectral&&block.spectral.begin>=start)windows.push(block.spectral);}
  }
  assert(blocks.length>=4,'Too few actual output frames in '+name);
  return {blocks,windows,peak:Math.max(...blocks.map(block=>block.peak)),acRms:Math.max(...blocks.flatMap(block=>block.acRms)),difference:Math.max(...blocks.map(block=>block.difference)),frames:blocks.reduce((n,b)=>n+b.frames,0)};
}
function quiet(result,name,options){const phase=phaseData(result,name,options);assert(phase.peak<1e-7,`${name}: nonzero stopped/paused PCM ${phase.peak}`);return {frames:phase.frames,peak:phase.peak};}
function hasBands(phase,channel,expected){return phase.windows.some(window=>expected.every(([frequency,minimum])=>window.bands[channel][[110,220,330,440,660,880].indexOf(frequency)]>minimum));}
function originalChecks(result,key,execution){
  const checks={};
  if(key==='cdda'){
    const first=phaseData(result,'PHASE_CDDA_PLAY');assert(first.difference>.01&&hasBands(first,0,[[220,.02]])&&hasBands(first,1,[[330,.02]]),'First stereo track');
    const third=phaseData(result,'PHASE_CDDA_TRACK3');assert(hasBands(third,0,[[440,.02]])&&hasBands(third,1,[[660,.02]]),'Second stereo track');
    checks.pause=quiet(result,'PHASE_CDDA_PAUSE');checks.stop=quiet(result,'PHASE_CDDA_STOP');checks.eof=quiet(result,'PHASE_CDDA_EOF');
    for(const phase of ['PHASE_CDDA_RESUME','PHASE_CDDA_SEEK','PHASE_CDDA_REPLAY'])assert(phaseData(result,phase).acRms>.01,phase+' remains audible');
    const c=result.commands.filter(command=>command.processor==='tetorica-cdda');for(const method of ['pause','resume','seek','stop'])assert(c.some(command=>command.method===method),'Missing '+method+' command');
    assert(c.some(command=>command.method==='play'&&command.sourceFrame===11025),'Replay offset is 0.25 source seconds');checks.stereoTracks=[{left:220,right:330},{left:440,right:660}];
  }else if(key==='adpcm'){
    const play=phaseData(result,'PHASE_ADPCM_PLAY',{before:.5});assert(play.difference<1e-7&&hasBands(play,0,[[220,.02]]),'Decoded mono 220 Hz');
    checks.firstEof=quiet(result,'PHASE_ADPCM_EOF',{after:.03});checks.stop=quiet(result,'PHASE_ADPCM_STOP');
    assert(phaseData(result,'PHASE_ADPCM_LOOP').acRms>.005,'Odd-start loop remains audible');assert(phaseData(result,'PHASE_ADPCM_REPLAY',{before:.5}).acRms>.01,'Prepared RAM replays');
    const c=result.commands.filter(command=>command.processor==='tetorica-msm5205');assert(c.some(command=>command.method==='prepare'&&command.bytes===2400),'Bounded 0.6-second encoded sample');
    assert(c.some(command=>command.method==='play'&&command.offset===1&&command.length===4798&&command.rate===12),'Odd nibble start, bounded nibble length and hardware rate');checks.encodedBytes=2400;
  }else{
    const cdda=phaseData(result,'PHASE_MIX_CDDA',{after:.15});assert(hasBands(cdda,0,[[220,.01]])&&hasBands(cdda,1,[[330,.01]]),'CD-DA-only stereo bed');
    const psg=phaseData(result,'PHASE_MIX_PSG',{after:execution==='worker'?.65:.12});assert(hasBands(psg,0,[[440,.001]]),'PSG-only A4');
    const adpcm=phaseData(result,'PHASE_MIX_ADPCM',{after:execution==='worker'?.65:.12});assert(hasBands(adpcm,0,[[880,.015]]),'ADPCM-only 880 Hz');
    const all=phaseData(result,'PHASE_MIX_ALL',{after:execution==='worker'?.65:.12});assert(hasBands(all,1,[[330,.01],[440,.001],[880,.01]]),'Three actual source contributions in the same final stereo window');
    checks.stop=quiet(result,'PHASE_MIX_STOP',{after:execution==='worker'?.65:.12});checks.contributions={cddaFrames:cdda.frames,psgFrames:psg.frames,adpcmFrames:adpcm.frames,mixedFrames:all.frames};
  }
  return checks;
}

async function gateWasm(page,name){
  let release,requested;const held=new Promise(resolve=>release=resolve),started=new Promise(resolve=>requested=resolve),pattern=`**/generated/${name}_wasm.wasm*`;
  await page.route(pattern,async route=>{requested();await held;try{await route.continue();}catch(error){if(!/closed|cancel|abort|Target|handled/i.test(String(error)))throw error;}});
  return {release,async wait(){let timer;try{await Promise.race([started,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('WASM was not requested: '+name)),20000);})]);}finally{clearTimeout(timer);}},remove:()=>page.unroute(pattern)};
}
function editedSource(seconds,{fail=false}={}){
  return `pce.initialize();
const auditMono=Float32Array.from({length:4000},(_,i)=>.18*Math.sin(2*Math.PI*440*i/8000)*Math.min(1,i/200,(3999-i)/200));
await adpcm.loadSample({channels:[auditMono],sampleRate:8000},{rate:12});
await adpcm.play({loop:true});
console.log('AUDIT_EDITED_PLAY');
await sleep(${seconds});
${fail?"throw Error('EXPECTED_CDROM2_FAILURE');":`await adpcm.stop();
await mixer.set('msm5205',{muted:true});
console.log('AUDIT_EDITED_SILENT');
await sleep(.18);`}`;
}
async function checkExample(browser,base,browserName,key,path,execution){
  const page=await browser.newPage({serviceWorkers:'block',viewport:{width:1280,height:900}}),errors=[],bad=[];page.setDefaultTimeout(25000);
  page.on('pageerror',error=>errors.push(error.stack??error.message));page.on('response',response=>{if(response.status()>=400)bad.push({url:response.url(),status:response.status()});});
  await page.addInitScript(installOutputAudit);const checks={example:key,path,execution};
  let gate=await gateWasm(page,'huc6280');
  try{
    await page.goto(`${base}examples/${path}/web/index.html`);await status(page,'Ready.');
    await until(page,async()=>Boolean((await page.locator('#code').inputValue()).trim())||bad.length>0,'Editable source did not load');
    assert.deepEqual(bad,[],'Missing built-page imports');await controls(page);assert.deepEqual((await audit(page)).contexts,[],'Opening the page began audio');
    assert.equal(await page.locator('#execution').inputValue(),'worker');await page.selectOption('#execution',execution);
    const original=await page.locator('#code').inputValue();
    await reset(page,'cancel-primary');await page.locator('#code').fill("console.log('CANCELLED_SOURCE_EXECUTED');\n"+original);
    await page.click('#play');await gate.wait();await page.click('#stop');gate.release();await status(page,'Stopped.');await closed(page);await controls(page);
    assert.doesNotMatch(await page.locator('#detail').textContent(),/CANCELLED_SOURCE_EXECUTED/);checks.cancelPrimary=summary(await audit(page),{audible:false});await gate.remove();

    gate=await gateWasm(page,key==='adpcm'?'msm5205':'cdda');await reset(page,'cancel-media');await page.locator('#code').fill(original);
    await page.click('#play');await gate.wait();await page.click('#stop');gate.release();await status(page,'Stopped.');await closed(page);checks.cancelMedia=summary(await audit(page),{audible:false});await gate.remove();

    await reset(page,'original');await page.locator('#code').fill(original);await page.click('#play');await status(page,'Finished.');await closed(page);await controls(page);
    const result=await audit(page),devices=['tetorica-huc6280',...(key!=='adpcm'?['tetorica-cdda']:[]),...(key!=='cdda'?['tetorica-msm5205']:[])];
    checks.original=summary(result,{devices});checks.playback=originalChecks(result,key,execution);
    assert(!result.nodes.some(node=>node.processor===(key==='cdda'?'tetorica-msm5205':key==='adpcm'?'tetorica-cdda':'never')),'Standalone example created an unused media source');

    await reset(page,'edited-stop');await page.locator('#code').fill(editedSource(30));await page.click('#play');await status(page,'Playing');await controls(page,true);
    await until(page,async()=>(await audit(page)).meters.flatMap(m=>m.blocks).some(block=>block.phase==='AUDIT_EDITED_PLAY'&&block.acRms[0]>.01),'Edited source did not make actual PCM');
    await page.click('#stop');await status(page,'Stopped.');await closed(page);checks.stopPlayback=summary(await audit(page),{devices:['tetorica-huc6280','tetorica-msm5205']});

    await reset(page,'edited-rerun');await page.locator('#code').fill(editedSource(.6));await page.click('#play');await status(page,'Finished.');await closed(page);await controls(page);
    const rerun=await audit(page);checks.rerun=summary(rerun,{devices:['tetorica-huc6280','tetorica-msm5205']});checks.rerun.silence=quiet(rerun,'AUDIT_EDITED_SILENT',{after:.04});
    assert(hasBands(phaseData(rerun,'AUDIT_EDITED_PLAY'),0,[[440,.02]]),'Edited 440 Hz source, not cached original');

    await reset(page,'syntax-error');await page.locator('#code').fill('const broken = ;');await page.click('#play');await status(page,'Error:');await closed(page);await controls(page);checks.syntaxCleanup=summary(await audit(page),{audible:false});
    await reset(page,'runtime-error');await page.locator('#code').fill(editedSource(.2,{fail:true}));await page.click('#play');await status(page,'Error:');await closed(page);await controls(page);assert.match(await page.locator('#detail').textContent(),/EXPECTED_CDROM2_FAILURE/);checks.runtimeCleanup=summary(await audit(page),{devices:['tetorica-huc6280','tetorica-msm5205']});

    await reset(page,'pagehide');await page.locator('#code').fill(editedSource(30));await page.click('#play');await status(page,'Playing');await until(page,async()=>(await audit(page)).meters.flatMap(m=>m.blocks).some(b=>b.acRms[0]>.01),'Pagehide fixture stayed silent');
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));await status(page,'Stopped.');await closed(page);await controls(page);checks.pagehide=summary(await audit(page),{devices:['tetorica-huc6280','tetorica-msm5205']});
    if(execution==='main'&&browserName==='chromium'){
      await page.locator('#code').fill(original);
      const desktop=join(images,`${key}-desktop.png`);await page.screenshot({path:desktop,fullPage:false});checks.screenshot=desktop;
      if(key==='mix'){await page.setViewportSize({width:390,height:844});const compact=join(images,'mix-compact.png');await page.screenshot({path:compact,fullPage:false});checks.compactScreenshot=compact;}
    }
    assert.deepEqual(errors,[],'Unexpected uncaught errors');assert.deepEqual(bad,[],'Missing complete-site assets');return checks;
  }catch(error){console.error({browser:browserName,key,execution,status:await page.locator('#status').textContent(),detail:await page.locator('#detail').textContent(),errors,bad});throw error;}
  finally{gate.release();await page.close();}
}

try{
  const pkg=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8'));assert.equal(pkg.version,'0.2.32','Use the published npm package');
  for(const path of Object.values(cases))await stat(join(site,'examples',path,'web/index.html'));
  await mkdir(images,{recursive:true});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`,results=[];
  for(const[name,engine]of Object.entries(engines)){
    const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--autoplay-policy=no-user-gesture-required']}: {})});
    try{
      const catalog=await browser.newPage();await catalog.goto(base);for(const path of Object.values(cases))await catalog.locator(`a[href="./examples/${path}/web/index.html"]`).waitFor();await catalog.close();
      for(const[key,path]of Object.entries(cases)){if(selectedCase&&selectedCase!==key)continue;for(const run of execution?[execution]:['main','worker']){
        const result=await checkExample(browser,base,name,key,path,run);results.push({browser:name,version:browser.version(),...result});console.log(`PASS ${name}/${key}/${run}: static published runtime, real source PCM, cancellation, editing and cleanup`);
      }}
    }finally{await browser.close();}
  }
  for(const[name,entry]of served)assert.equal(sha(await readFile(join(site,name))),entry.sha256,'Served file changed after check: '+name);
  assert.deepEqual(missing,[],'Requests escaped the complete static site');
  const report={schemaVersion:1,passed:true,packageVersion:pkg.version,site,subpath:prefix,physicalOutputMuted:true,results,sources:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b))),checkerSha256:sha(await readFile(fileURLToPath(import.meta.url)))};
  if(receiptPath)await writeFile(receiptPath,JSON.stringify(report,null,2)+'\n');
}finally{if(server.listening)await new Promise(resolve=>server.close(resolve));}

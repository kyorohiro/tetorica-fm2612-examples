// Original PCM -> software helpers -> actual chip -> disposable AudioBuffer.
// Build first. Serve only the built site; mute every final physical output.
import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
for(const argument of args)assert(/^(--(?:root|case|out)=.+|--chromium|--webkit)$/.test(argument),'Unknown option '+argument);
assert(!(args.includes('--chromium')&&args.includes('--webkit')),'Choose one browser or omit both');
const option=name=>args.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3);
const site=resolve(repository,option('root')??'dist'),out=option('out')?resolve(option('out')):null,prefix='/examples-site/';
const cases={brr:{path:'snes/03-pcm-to-brr',wasm:'spc_wasm.wasm',rate:32000,frames:38400,hz:500},adpcm:{path:'neo-geo/adpcm-a/01-pcm-encode',wasm:'ym2610b_wasm.wasm',rate:48000,frames:52800,hz:440},gameboy:{path:'gameboy/pcm/01-wave-preview',wasm:'gameboy_apu_wasm.wasm',rate:44100,frames:37485,hz:440}};
if(option('case'))assert(Object.hasOwn(cases,option('case')),'Unknown case '+option('case'));
const served=new Map(),missing=[],sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
 assert(pathname.startsWith(prefix),'Only built-site requests are allowed');let file=resolve(site,pathname.slice(prefix.length));const local=relative(site,file);assert(local!=='..'&&!local.startsWith('..'+sep)&&!local.startsWith(sep));if((await stat(file)).isDirectory())file=join(file,'index.html');
 const bytes=await readFile(file),name=relative(site,file).split(sep).join('/'),record={bytes:bytes.length,sha256:sha(bytes)};if(served.has(name))assert.deepEqual(served.get(name),record,'Built asset changed '+name);served.set(name,record);
 res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','cache-control':'no-store'}).end(bytes);
}catch(error){missing.push({url:req.url,error:error.message});res.writeHead(404).end(error.message);}});
function installAudit(){
 const NativeContext=window.AudioContext??window.webkitAudioContext,connect=AudioNode.prototype.connect,start=AudioBufferSourceNode.prototype.start;
 const contexts=[],buffers=[],sinks=[];let phase='load';
 window.AudioContext=new Proxy(NativeContext,{construct(Target,args){const context=Reflect.construct(Target,args);contexts.push({context,phase});return context;}});if(window.webkitAudioContext===NativeContext)window.webkitAudioContext=window.AudioContext;
 AudioNode.prototype.connect=function(destination,...args){if(destination!==this.context.destination)return connect.call(this,destination,...args);const analyser=this.context.createAnalyser(),mute=this.context.createGain();analyser.fftSize=4096;mute.gain.value=0;connect.call(this,analyser);connect.call(analyser,mute);connect.call(mute,destination);sinks.push({phase,context:this.context,analyser,mute,acRms:0,peak:0});return destination;};
 AudioBufferSourceNode.prototype.start=function(...args){
  const buffer=this.buffer,channels=Array.from({length:buffer.numberOfChannels},(_,channel)=>buffer.getChannelData(channel)),first=Math.round(.12*buffer.sampleRate),last=Math.min(channels[0].length,Math.round(.65*buffer.sampleRate));
  let sum=0,squares=0,peak=0,finite=true,difference=0;const crossings=[];
  for(let i=0;i<channels[0].length;i++){for(const channel of channels){finite&&=Number.isFinite(channel[i]);peak=Math.max(peak,Math.abs(channel[i]));}difference=Math.max(difference,Math.abs(channels[0][i]-(channels[1]?.[i]??channels[0][i])));if(i>=first&&i<last){const value=channels[0][i];sum+=value;squares+=value*value;if(i>first&&channels[0][i-1]<=0&&value>0)crossings.push(i-1-channels[0][i-1]/(value-channels[0][i-1]));}}
  const count=last-first,mean=sum/count;buffers.push({phase,frames:buffer.length,sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,finite,peak,acRms:Math.sqrt(Math.max(0,squares/count-mean*mean)),frequency:crossings.length>4?buffer.sampleRate*(crossings.length-1)/(crossings.at(-1)-crossings[0]):0,channelDifference:difference,first:channels[0][0],last:channels[0].at(-1)});return start.apply(this,args);
 };
 window.__pcmHelpers={phase(value){phase=value;},read(){for(const sink of sinks){if(sink.context.state!=='running')continue;const data=new Float32Array(sink.analyser.fftSize);sink.analyser.getFloatTimeDomainData(data);let sum=0,squares=0,peak=0;for(const value of data){sum+=value;squares+=value*value;peak=Math.max(peak,Math.abs(value));}sink.acRms=Math.max(sink.acRms,Math.sqrt(Math.max(0,squares/data.length-(sum/data.length)**2)));sink.peak=Math.max(sink.peak,peak);}return {contexts:contexts.map(value=>({phase:value.phase,state:value.context.state})),buffers:[...buffers],sinks:sinks.map(({phase,context,mute,acRms,peak})=>({phase,sampleRate:context.sampleRate,muted:mute.gain.value===0,acRms,peak}))};}};
 setInterval(()=>window.__pcmHelpers.read(),20);
}
async function bounded(task,label,ms=15000){let timer;try{return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Timed out: '+label)),ms);})]);}finally{clearTimeout(timer);}}
const evaluate=(page,fn,arg)=>bounded(page.evaluate(fn,arg),'page audit');
const audit=page=>evaluate(page,()=>__pcmHelpers.read());
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(page,predicate,label,ms=15000){const end=Date.now()+ms;while(Date.now()<end){if(await predicate())return;await pause(25);}throw Error(label+'; status='+await page.locator('#status').textContent()+'; detail='+await page.locator('#detail').textContent());}
const status=(page,text)=>until(page,async()=>((await page.locator('#status').textContent())??'').startsWith(text),'Expected '+text);
const closed=page=>until(page,async()=>(await audit(page)).contexts.every(context=>context.state==='closed'),'Unclosed AudioContext');
function verifyBuffer(data,config){assert(data.finite&&data.peak<.99&&data.acRms>.001,'finite unclipped sustained AC');assert(data.channels===2&&data.channelDifference<1e-7,'Actual chip is mono duplicated into stereo');assert(Math.abs(data.frequency-config.hz)<8,'Expected chip tone near '+config.hz+', got '+data.frequency);}
async function check(browser,base,browserName,name,config){
 const page=await browser.newPage({acceptDownloads:true,serviceWorkers:'block'});page.setDefaultTimeout(15000);const errors=[],consoleErrors=[],failed=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
 const origin=new URL(base).origin;page.on('request',request=>{const url=new URL(request.url());if(url.origin!==origin&&!['blob:','data:'].includes(url.protocol))external.push(url.href);});
 let release,requested;const held=new Promise(resolve=>{release=resolve;}),started=new Promise(resolve=>{requested=resolve;});let hold=true;
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==origin&&!['blob:','data:'].includes(url.protocol))return route.abort();if(hold&&url.pathname.endsWith('/'+config.wasm)){hold=false;requested();await held;try{return await route.continue();}catch{return;}}return route.continue();});
 await page.addInitScript(installAudit);
 try{
  console.log('CHECK '+browserName+'/'+name+': abortable real-chip preparation, source comparison, WAV and cleanup');
  await page.goto(base+'examples/'+config.path+'/web/index.html');await status(page,'Ready.');assert.deepEqual((await audit(page)).contexts,[],'Page load starts no output');
  await evaluate(page,()=>__pcmHelpers.phase('cancel'));await page.click('#play');await bounded(started,'first WASM request');await page.click('#stop');await status(page,'Stopped.');release();await closed(page);assert.equal((await audit(page)).buffers.length,0,'Cancelled conversion must not start a late buffer');
  await evaluate(page,()=>__pcmHelpers.phase('chip'));await page.click('#play');await status(page,'Playing chip');
  await until(page,async()=>(await audit(page)).sinks.some(sink=>sink.phase==='chip'&&sink.muted&&sink.acRms>.001),'Actual chip buffer reached final muted output');
  const metadata=await evaluate(page,()=>JSON.parse(document.getElementById('detail').textContent));assert.equal(metadata.softwarePreparation,true);
  const chip=(await audit(page)).buffers.find(buffer=>buffer.phase==='chip');verifyBuffer(chip,config);assert.equal(chip.frames,config.frames);assert.equal(chip.sampleRate,config.rate);
  if(name==='brr'){assert.equal(metadata.loopStartSamples,0);assert.equal(metadata.encodedBytes,36);assert.equal(metadata.paddingFrames,0);assert.equal(metadata.hardwarePitch,4096);}
  if(name==='adpcm'){assert.equal(metadata.decodedRate,8000000/432);assert.equal(metadata.startAddress%256,0);assert.equal(metadata.endAddress%256,0);assert.equal(metadata.encodedBytes,8192);assert.equal(metadata.hardwarePitchControl,false);assert.equal(metadata.hardwareLoop,false);}
  if(name==='gameboy'){assert.equal(metadata.waveRam.length,32);assert(metadata.waveRam.every(value=>Number.isInteger(value)&&value>=0&&value<=15));assert.equal(metadata.extraPreviewGain,1);assert.equal(metadata.endpointFadeSeconds,.005);assert.equal(chip.first,0);assert.equal(chip.last,0);}
  await status(page,'Finished.');await closed(page);assert.equal(await page.locator('#stop').isDisabled(),true);
  const downloading=page.waitForEvent('download');await page.click('#save');const download=await downloading,wav=await readFile(await download.path());assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt32LE(24),config.rate);assert.equal(wav.length,44+config.frames*4);
  let peak=0;for(let i=44;i<wav.length;i+=2)peak=Math.max(peak,Math.abs(wav.readInt16LE(i)/32768));assert(Math.abs(peak-chip.peak)<.0001,'WAV uses actual returned chip PCM without extra gain');
  await evaluate(page,()=>__pcmHelpers.phase('source'));await page.click('#sourcePlay');await status(page,'Playing source');const source=(await audit(page)).buffers.find(buffer=>buffer.phase==='source');assert(source&&source.finite&&source.acRms>.001&&source.peak<.99);await page.click('#stop');await status(page,'Stopped.');await closed(page);
  await evaluate(page,()=>__pcmHelpers.phase('restart'));await page.click('#play');await status(page,'Playing chip');await page.click('#stop');await status(page,'Stopped.');await closed(page);
  const final=await audit(page);assert(final.sinks.every(sink=>sink.muted));assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
  return {browser:browserName,example:config.path,chip,source,metadata,cancelledPreparationSilent:true,stopAndFinishCloseContexts:true,savedWavFrames:config.frames};
 }catch(error){release();console.error(JSON.stringify({browser:browserName,example:name,status:await page.locator('#status').textContent().catch(()=>null),errors,consoleErrors,failed,external,audit:await audit(page).catch(()=>null)}));throw error;}
 finally{release();await bounded(page.close(),'close example');}
}
try{
 const declared=JSON.parse(await readFile(join(repository,'package.json'),'utf8')).dependencies['tetorica-fm2612'],installed=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8'));assert.equal(installed.version,declared);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base='http://127.0.0.1:'+server.address().port+prefix,results=[];
 const browsers=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
 for(const[name,engine]of browsers){const browser=await bounded(engine.launch({headless:true}),'launch browser',30000);try{for(const[key,config]of Object.entries(cases))if(!option('case')||option('case')===key)results.push(await check(browser,base,name,key,config));}finally{await bounded(browser.close(),'close browser');}}
 assert.deepEqual(missing,[],'No source tree or sibling fallback');
 const report={schemaVersion:1,passed:true,packageVersion:installed.version,physicalOutputMuted:true,listeningPerformed:false,staticSiteOnly:true,results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)))};
 if(out){await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');}
 console.log('PASS '+results.length+' PCM helper example/browser cases: actual chip PCM, source comparison, prepare cancellation, WAV gain and lifecycle');
}finally{server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}

// Verify the installed-package examples from an isolated static-site subpath.
// Every physical destination is intercepted and permanently muted before Play.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,extname,join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const arg of args)assert(/^--(?:site|out|sample-rate)=/.test(arg)||['--chromium','--webkit'].includes(arg),'Unknown argument '+arg);
const option=(name,fallback)=>args.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3)??fallback;
const requestedSampleRate=Number(option('sample-rate','48000'));
assert([44100,48000].includes(requestedSampleRate),'Use --sample-rate=44100 or 48000');
const site=resolve(repo,option('site','dist')),out=resolve(option('out','/private/tmp/tetorica-timed-examples-browser.json'));
const prefix='/published-examples/',mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.md':'text/plain'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
    const file=resolve(site,pathname.slice(prefix.length)+(pathname.endsWith('/')?'index.html':''));
    if(!file.startsWith(site+sep)){res.writeHead(403).end();return;}
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(file));
  }catch{res.writeHead(404).end();}
});

function installAudit({sampleRate}){
  const Context=window.AudioContext??window.webkitAudioContext,Worklet=window.AudioWorkletNode;
  const connect=AudioNode.prototype.connect,post=MessagePort.prototype.postMessage;
  const audit=window.__timedExamples={contexts:[],nodes:[],meters:[],traffic:[],receipts:[],ports:new Map(),sequence:0};
  window.AudioContext=class extends Context{constructor(options={}){super({...options,sampleRate});audit.contexts.push(this);}};
  if(window.webkitAudioContext)window.webkitAudioContext=window.AudioContext;
  window.AudioWorkletNode=class extends Worklet{constructor(context,name,options){super(context,name,options);audit.nodes.push({name,type:options?.processorOptions?.type,engine:options?.processorOptions?.engine});}};
  AudioNode.prototype.connect=function(destination,...rest){
    if(destination!==this.context.destination)return connect.call(this,destination,...rest);
    const meter=this.context.createAnalyser(),mute=this.context.createGain();meter.fftSize=2048;mute.gain.value=0;
    connect.call(this,meter);connect.call(meter,mute);connect.call(mute,destination);
    audit.meters.push({meter,mute,context:this.context,peak:0,acRms:0,finite:true});return destination;
  };
  MessagePort.prototype.postMessage=function(data,...rest){
    if(['ayTimed','ym2612Timed'].includes(data?.method)){
      audit.ports.set(data.method,this);const payload=structuredClone(data.args[0]);
      audit.traffic.push({method:data.method,...payload});
      if(data.id!==undefined){const port=this,listener=event=>{
        if(event.data?.id!==data.id)return;port.removeEventListener('message',listener);
        audit.receipts.push({method:data.method,action:payload.action,name:payload.options?.name,ok:!event.data.error,value:event.data.value,error:event.data.error});
      };port.addEventListener('message',listener);port.start();}
    }
    return post.call(this,data,...rest);
  };
  audit.sample=()=>{
    for(const item of audit.meters){if(item.context.state!=='running')continue;
      const pcm=new Float32Array(item.meter.fftSize);item.meter.getFloatTimeDomainData(pcm);
      let sum=0,square=0;
      for(const value of pcm){item.finite&&=Number.isFinite(value);item.peak=Math.max(item.peak,Math.abs(value));sum+=value;square+=value*value;}
      item.acRms=Math.max(item.acRms,Math.sqrt(Math.max(0,square/pcm.length-(sum/pcm.length)**2)));
    }
    return {contexts:audit.contexts.map(c=>c.state),sampleRates:audit.contexts.map(c=>c.sampleRate),nodes:audit.nodes,meters:audit.meters.map(({peak,acRms,finite,mute})=>({peak,acRms,finite,muted:mute.gain.value===0}))};
  };
  audit.capture=method=>new Promise((resolve,reject)=>{
    const port=audit.ports.get(method);if(!port){reject(Error('No live timed client'));return;}
    const id='timed-example-audit:'+ ++audit.sequence;
    const timeout=setTimeout(()=>{port.removeEventListener('message',listener);reject(Error('Timed capture response exceeded 5 seconds'));},5000);
    const listener=event=>{if(event.data?.id!==id)return;clearTimeout(timeout);port.removeEventListener('message',listener);event.data.error?reject(Error(event.data.error)):resolve(event.data.value);};
    port.addEventListener('message',listener);port.start();port.postMessage({method,id,args:[{action:'capture'}]});
  });
  setInterval(audit.sample,10);
}
const cases=[
  {id:'atari-st/ym2149/01-sync-buzzer',kind:'ayTimed',rows:1},
  {id:'atari-st/ym2149/02-volume-modulation',kind:'ayTimed',rows:16},
  {id:'genesis/fm/07-timed-operators',kind:'ym2612Timed',engine:'ymfm',rows:32},
  {id:'genesis/fm/07-timed-operators',kind:'ym2612Timed',engine:'nuked',rows:32},
  {id:'chip-raw/02-compile-compare',compare:true},
];
async function closed(page){await page.waitForFunction(()=>__timedExamples.contexts.every(c=>c.state==='closed'));}
async function runCase(browser,browserName,base,item){
  const page=await browser.newPage({serviceWorkers:'block'}),errors=[],missing=[];
  await page.addInitScript(installAudit,{sampleRate:requestedSampleRate});page.setDefaultTimeout(25000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});});
  const result={browser:browserName,example:item.id,...(item.engine?{engine:item.engine}:{})};
  try{
    await page.goto(base+'examples/'+item.id+'/web/index.html');
    assert.equal(await page.locator('#status').textContent(),'Ready.');
    assert.equal(await page.evaluate(()=>__timedExamples.contexts.length),0,'Cold page opens no audio');
    if(item.engine)await page.locator('#engine').selectOption(item.engine);
    const original=await page.locator('#code').inputValue(),button=item.compare?'#inspect':'#play';
    await page.locator('#code').fill('const broken = ;');await page.locator(button).click();
    await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Error:'));
    assert.equal(await page.evaluate(()=>__timedExamples.contexts.length),0,'Syntax rejected before audio');
    await page.locator('#code').fill(original);await page.locator(button).click();
    if(item.compare){
      await page.waitForFunction(()=>document.getElementById('status').textContent==='Compared.');await closed(page);
      const data=await page.locator('#results').evaluate(node=>JSON.parse(node.dataset.result));
      assert(Object.values(data.checks).every(value=>value===true));
      assert.deepEqual(Object.fromEntries(Object.entries(data.baselines).map(([name,rows])=>[name,rows[0].value])),
        {current:0x52,client:0x32,reset:2,snapshotA:0x52,snapshotB:0x11});
      assert.equal(await page.locator('#results table').count(),5);
      result.baselines=data.baselines;result.snapshot=data.snapshot;result.checks=data.checks;
      await page.locator(button).click();await page.waitForFunction(()=>document.getElementById('status').textContent==='Compared.');await closed(page);
    }else{
      await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Playing'));
      await page.waitForFunction(()=>__timedExamples.receipts.some(r=>r.action==='schedule'&&r.ok));
      const samples=[];
      for(let i=0;i<16;i++){samples.push(await page.evaluate(method=>__timedExamples.capture(method),item.kind));await page.waitForTimeout(20);}
      const schedule=await page.evaluate(()=>__timedExamples.traffic.find(t=>t.action==='schedule'));
      assert.equal(schedule.operations.operations.length,item.kind==='ayTimed'?(item.rows===1?1:16):32);
      assert(schedule.options.repeatSeconds>0);
      const rows=item.kind==='ayTimed'?'#writeRows tr':'#traceBody tr';assert.equal(await page.locator(rows).count(),item.rows);
      assert(samples.at(-1).frame>samples[0].frame,'Renderer keeps advancing');
      if(item.kind==='ayTimed'){
        assert(samples.every(s=>s.type===16&&s.clock===2000000));
        if(item.rows===1)assert(samples.every(s=>s.registers[13]===8));
        else assert(new Set(samples.map(s=>s.registers[8])).size>1,'R8 moves on Worklet');
      }else{
        assert(samples.every(s=>s.engine===item.engine));
        assert(new Set(samples.map(s=>s.registers[0][0x40])).size>1,'TL moves on Worklet');
        assert(new Set(samples.map(s=>s.registers[0][0x30]&15)).size>1,'MULT moves on Worklet');
        assert(samples.every(s=>(s.registers[0][0x30]&0x70)===0),'Partial MULT updates preserve DT');
      }
      await page.waitForFunction(()=>__timedExamples.sample().meters.some(m=>m.acRms>0.0001));
      result.repeatSeconds=schedule.options.repeatSeconds;result.writesPerPattern=schedule.operations.operations.length;
      await page.locator('#stop').click();await page.waitForFunction(()=>document.getElementById('status').textContent==='Stopped.');await closed(page);
      const count=await page.evaluate(()=>__timedExamples.traffic.filter(t=>t.action==='schedule').length);
      await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>__timedExamples.traffic.filter(t=>t.action==='schedule').length),count,'No late scheduling after Stop');
      // A user edit really runs; changing BPM leaves the scheduled Hz/seconds intact.
      await page.locator('#code').fill('console.log("EDITED_TIMED_EXAMPLE");\n'+original.replace(/setBpm\(\s*120\s*\)/,'setBpm(240)'));
      await page.locator(button).click();
      await page.waitForFunction(()=>document.getElementById('detail').textContent.includes('EDITED_TIMED_EXAMPLE'));
      await page.waitForFunction(()=>document.getElementById('status').textContent==='Finished.');await closed(page);
      assert.equal(await page.evaluate(()=>__timedExamples.traffic.filter(t=>t.action==='schedule')[1].options.repeatSeconds),schedule.options.repeatSeconds);
      // Stop while WASM fetch is pending; releasing the request cannot revive audio.
      let release,intercepted=false;const barrier=new Promise(resolve=>{release=resolve;});
      await page.route('**/*_wasm.wasm',async route=>{intercepted=true;await barrier;try{await route.continue();}catch{}});
      await page.locator('#code').fill(original);await page.locator(button).click();
      for(let turn=0;turn<200&&!intercepted;turn++)await page.waitForTimeout(10);
      assert(intercepted,'Actual WASM fetch intercepted');await page.locator('#stop').click();release();
      await page.waitForFunction(()=>document.getElementById('status').textContent==='Stopped.');await closed(page);
      await page.waitForTimeout(100);await closed(page);
      result.editedSource=true;result.pendingInitializationCancelled=true;
    }
    result.audit=await page.evaluate(()=>__timedExamples.sample());
    assert(result.audit.contexts.every(s=>s==='closed'));assert(result.audit.meters.length>0);
    assert(result.audit.sampleRates.every(rate=>rate===requestedSampleRate));
    assert(result.audit.meters.every(m=>m.muted&&m.finite&&m.peak<1));
    if(item.compare)assert(result.audit.meters.every(m=>m.peak===0),'Comparison stays silent');
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    result.passed=true;return result;
  }catch(error){result.error=error.stack??String(error);result.status=await page.locator('#status').textContent().catch(()=>null);result.detail=await page.locator('#detail').textContent().catch(()=>null);throw Object.assign(error,{caseResult:result});}
  finally{await page.close();}
}
let failure;const results=[];
try{
  const version=JSON.parse(await readFile(join(site,'vendor/tetorica-fm2612/package.json'),'utf8')).version;
  assert.equal(version,'0.2.41');
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const engines=args.includes('--chromium')?[['chromium',chromium]]:args.includes('--webkit')?[['webkit',webkit]]:[['chromium',chromium],['webkit',webkit]];
  for(const [name,engine]of engines){const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio','--autoplay-policy=no-user-gesture-required']}:{})});try{for(const item of cases){results.push(await runCase(browser,name,base,item));console.log('PASS '+name+'/'+item.id+'/'+(item.engine??'default')+' (physical gain0)');}}finally{await browser.close();}}
}catch(error){failure=error;if(error.caseResult)results.push(error.caseResult);}
finally{
  server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));
  await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify({passed:!failure,packageVersion:'0.2.41',sampleRate:requestedSampleRate,physicalOutputMuted:true,staticSiteOnly:true,site,results},null,2)+'\n');
}
if(failure)throw failure;console.log('PASS timed examples: '+out);

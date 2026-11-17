// Published npm assets only, served from a built site under a non-root path.
// Both actual AudioWorklet output and offline browser WASM PCM are checked.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.some(arg => !['--chromium','--webkit'].includes(arg) && !/^--(?:root|out)=.+$/.test(arg)) ||
    (args.includes('--chromium') && args.includes('--webkit'))) {
  throw new Error('Usage: node scripts/check-scsp-dsp-browser.mjs [--root=dist] [--chromium|--webkit] [--out=report.json]');
}
const root = resolve(repository, args.find(arg => arg.startsWith('--root='))?.slice(7) ?? 'dist');
const output = args.find(arg => arg.startsWith('--out='))?.slice(6);
const served = new Map(), failedRequests = [], externalRequests = [];
async function bounded(task, label, ms=30000) {
  let timer;
  try { return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Timed out: '+label)),ms);})]); }
  finally { clearTimeout(timer); }
}
async function monitoredPage(browser, base, options={}) {
  const page=await browser.newPage({serviceWorkers:'block',...options}), origin=new URL(base).origin;
  await page.route('**/*', route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin&&!['data:','blob:'].includes(url.protocol)){
      externalRequests.push(url.href);return route.abort();
    }
    return route.continue();
  });
  return page;
}
const prefix = '/scsp-examples/';
const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.json':'application/json','.css':'text/css'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
    if (!pathname.startsWith(prefix)) throw new Error('Outside site');
    let file = resolve(root, pathname.slice(prefix.length));
    const local = relative(root, file);
    if (local === '..' || local.startsWith('..' + sep)) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const bytes=await readFile(file), name=relative(root,file).split(sep).join('/');
    const record={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
    if(served.has(name))assert.deepEqual(served.get(name),record,'Served source changed during validation');
    served.set(name,record);
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(bytes);
  } catch (error) { failedRequests.push(request.url);response.writeHead(404).end(String(error)); }
});

function installMutedMeter(rate) {
  const Context=window.AudioContext??window.webkitAudioContext;
  window.AudioContext=class extends Context {constructor(options={}){super({...options,sampleRate:rate});}};
  if(window.webkitAudioContext)window.webkitAudioContext=window.AudioContext;
  const connect = AudioNode.prototype.connect, meters = [], observed = new WeakMap();
  // Replace every physical destination edge with a metered, zero-gain edge.
  // Tests observe actual PCM without playing sound on the developer's speakers.
  AudioNode.prototype.connect = function(destination, ...args) {
    if (destination !== this.context.destination) return connect.call(this, destination, ...args);
    let meter = observed.get(this);
    if (!meter) {
      const analyser = this.context.createAnalyser(), mute = this.context.createGain();
      analyser.fftSize = 2048; mute.gain.value = 0;
      connect.call(analyser, mute); connect.call(mute, destination);
      meter = {context:this.context, analyser, pcm:new Float32Array(2048), peak:0, invalid:false};
      observed.set(this, meter); meters.push(meter);
    }
    connect.call(this, meter.analyser); return destination;
  };
  function sample() {
    for (const m of meters) {
      if (m.context.state !== 'running') continue;
      m.analyser.getFloatTimeDomainData(m.pcm);
      let energy = 0;
      for (const value of m.pcm) { m.invalid ||= !Number.isFinite(value); energy += value * value; }
      m.peak = Math.max(m.peak, Math.sqrt(energy / m.pcm.length));
    }
  }
  setInterval(sample, 15);
  window.__scspMeter = {
    reset() { for (const m of meters) m.peak = 0; },
    read() { sample(); return {peak:Math.max(0,...meters.map(m=>m.peak)), invalid:meters.some(m=>m.invalid), states:meters.map(m=>m.context.state)}; },
  };
}
async function status(page, text) {
  await page.waitForFunction(text => document.getElementById('status').textContent.startsWith(text), text)
    .catch(async error => { throw new Error(`Expected ${text}; status=${await page.locator('#status').textContent()}; detail=${await page.locator('#detail').textContent()}`, {cause:error}); });
}
async function stopped(page) {
  await status(page, 'Stopped.');
  await page.waitForFunction(() => window.__scspMeter.read().states.every(state => state === 'closed'));
  assert(await page.locator('#play').isEnabled());
  assert(await page.locator('#execution').isEnabled());
  const meter = await page.evaluate(() => window.__scspMeter.read());
  assert.equal(meter.invalid, false); return meter;
}

async function changed(page,id,value,event='input') {
  await page.locator('#'+id).evaluate((element,{value,event})=>{
    element.value=String(value);element.dispatchEvent(new Event(event,{bubbles:true}));
  },{value,event});
}
async function state(page,predicate){
  await page.waitForFunction(predicate);
  return JSON.parse(await page.locator('#state').textContent());
}
async function silence(page){
  await page.waitForTimeout(200);await page.evaluate(()=>__scspMeter.reset());await page.waitForTimeout(100);
  assert((await page.evaluate(()=>__scspMeter.read())).peak<1e-6,'Expected real wet silence');
}
async function exercise(browser,base,lesson,execution,rate){
  const page=await monitoredPage(browser,base),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(25000);
  await page.addInitScript(installMutedMeter,rate);
  try{
    await page.goto(`${base}examples/saturn/scsp/${lesson}/web/index.html`);await status(page,'Ready.');
    assert.deepEqual((await page.evaluate(()=>__scspMeter.read())).states,[],'Cold page must not open audio');
    await page.selectOption('#execution',execution);await page.click('#play');await status(page,'Playing');
    await page.waitForFunction(()=>__scspMeter.read().peak>.0001);
    await page.waitForFunction(()=>!!document.getElementById('state').textContent);
    let current=JSON.parse(await page.locator('#state').textContent());
    const sampleId=current.samples.at(-1).id,ramUsed=current.ramUsedBytes;
    if(lesson==='04-dsp-programs'){
      await changed(page,'gain',0);
      await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.coefficients.codes[0]===0);
      await silence(page);
      await page.evaluate(()=>__scspMeter.reset());await changed(page,'gain',4095);
      await page.waitForFunction(()=>__scspMeter.read().peak>.0001);
      await page.selectOption('#effect','iir');
      current=await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.coefficients.codes[1]===3840);
      assert.equal(current.dsp.profile,'ram-free');assert.equal(current.slot.gate,true);
      assert.match(await page.locator('#listing').textContent(),/TRA=1/);
      await changed(page,'history',3072);
      current=await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.coefficients.codes[1]===3072);
      assert.equal(current.dsp.coefficients.codes[2],1024);assert(current.slot.gate);
    }else{
      assert.equal(current.dsp.profile,'delay-ring');assert.equal(current.dspRam.byteLength,65536);
      await changed(page,'feedback',2048);
      current=await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.delay.feedback===.5);
      assert.equal(current.slot.gate,true);assert.equal(current.dsp.ram.address,current.dspRam.address);
      await page.click('#release');
      current=await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').slot?.gate===false);
      await page.evaluate(()=>__scspMeter.reset());await page.waitForTimeout(150);
      assert((await page.evaluate(()=>__scspMeter.read())).peak>.0001,'Release retains real echoes');
      await changed(page,'time',120,'change');
      current=await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.delay.timeMs===120);
      await silence(page);
      await page.click('#retrigger');
      await page.waitForFunction(()=>__scspMeter.read().peak>.0001);
      await page.uncheck('#enabled');
      await state(page,()=>JSON.parse(document.getElementById('state').textContent||'{}').dsp?.delay.enabled===false);
      await silence(page);
    }
    assert.equal(current.ramUsedBytes,ramUsed);assert.equal(current.samples.at(-1).id,sampleId);
    assert.equal(current.slot.sample.id,sampleId);
    await page.click('#stop');await stopped(page);
    const code=await page.locator('#code').inputValue();
    await page.locator('#code').fill(code.replace('await beat(40);',"console.log('EDITED_DSP_CODE'); await beat(0.4);"));
    await page.evaluate(()=>__scspMeter.reset());await page.click('#play');await status(page,'Finished.');
    assert.match(await page.locator('#detail').textContent(),/EDITED_DSP_CODE/);
    assert((await page.evaluate(()=>__scspMeter.read())).peak>.0001);
    await page.waitForFunction(()=>__scspMeter.read().states.every(value=>value==='closed'));
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Mobile overflow');
    assert.deepEqual(errors,[]);
    return {lesson,execution,rate,passed:true,heldPcmPreserved:true,actualWetSignal:true,stopClosed:true,editableCode:true,physicalOutputMuted:true};
  }catch(error){console.error(JSON.stringify({lesson,execution,rate,status:await page.locator('#status').textContent(),detail:await page.locator('#detail').textContent(),state:await page.locator('#state').textContent(),errors},null,2));throw error;}
  finally{await bounded(page.close(),'close DSP lesson');}
}
try{
  const dependency=JSON.parse(await readFile(join(repository,'package.json'),'utf8')).dependencies['tetorica-fm2612'];
  const vendor=JSON.parse(await readFile(join(root,'vendor/tetorica-fm2612/package.json'),'utf8'));
  assert.equal(vendor.version,dependency,'Static runtime matches exact dependency');
  const results=[];
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const engines=args.includes('--chromium')?{chromium}:args.includes('--webkit')?{webkit}:{chromium,webkit};
  for(const [name,engine]of Object.entries(engines)){
    const browser=await bounded(engine.launch({headless:true}),'launch '+name);
    try{
      for(const rate of [44100,48000])for(const lesson of ['04-dsp-programs','05-dsp-delay'])for(const execution of ['main','worker']){
        const result=await exercise(browser,base,lesson,execution,rate);console.log(JSON.stringify({browser:name,...result}));results.push({browser:name,...result});
      }
    }finally{await bounded(browser.close(),'close '+name);}
  }
  assert.deepEqual(failedRequests,[]);assert.deepEqual(externalRequests,[]);
  if(output){const file=resolve(output);await mkdir(dirname(file),{recursive:true});await writeFile(file,JSON.stringify({passed:true,packageVersion:vendor.version,physicalOutputMuted:true,listeningPerformed:false,results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)))},null,2)+'\n');}
  console.log('PASS '+results.length+' SCSP DSP browser / rate / execution cases');
}finally{server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}

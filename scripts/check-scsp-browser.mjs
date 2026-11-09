// Published npm assets only, served from a built site under a non-root path.
// Both actual AudioWorklet output and offline browser WASM PCM are checked.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {readFile, stat, mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium, webkit} from 'playwright';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.some(arg => !['--chromium','--webkit','--node-wav'].includes(arg) && !/^--(?:root|out)=.+$/.test(arg)) ||
    (args.includes('--chromium') && args.includes('--webkit'))) {
  throw new Error('Usage: node scripts/check-scsp-browser.mjs [--root=dist] [--chromium|--webkit] [--node-wav] [--out=report.json]');
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

function installMutedMeter() {
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
async function waitState(page, predicate) {
  await page.waitForFunction(predicate);
  return JSON.parse(await page.locator('#state').textContent());
}
async function input(page, id, value) {
  await page.locator('#' + id).evaluate((element, value) => {
    element.value = String(value); element.dispatchEvent(new Event('input', {bubbles:true}));
  }, value);
}
async function stopped(page) {
  await status(page, 'Stopped.');
  await page.waitForFunction(() => window.__scspMeter.read().states.every(state => state === 'closed'));
  assert(await page.locator('#play').isEnabled());
  assert(await page.locator('#execution').isEnabled());
  const meter = await page.evaluate(() => window.__scspMeter.read());
  assert.equal(meter.invalid, false); return meter;
}
async function checkLesson(browser, base, lesson, execution) {
  const page = await monitoredPage(browser,base), errors = [], missing = [];
  page.setDefaultTimeout(25000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() === 404) missing.push(response.url()); });
  await page.addInitScript(installMutedMeter);
  try {
    await page.goto(`${base}examples/saturn/scsp/${lesson}/web/index.html`);
    await status(page, 'Ready.'); await page.selectOption('#execution', execution);
    if (lesson === '01-pcm') {
      let release, requested;
      const held = new Promise(resolve => { release = resolve; });
      const started = new Promise(resolve => { requested = resolve; });
      await page.route('**/generated/scsp_wasm.wasm*', async route => { requested(); await held; await route.continue(); });
      try {
        await page.click('#play');
        let timer;
        try { await Promise.race([started,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('SCSP WASM not requested')),20000);})]); }
        finally { clearTimeout(timer); }
        await page.click('#stop'); release();
        const cancelled = await stopped(page); assert.equal(cancelled.peak, 0);
      } finally { release(); await page.unroute('**/generated/scsp_wasm.wasm*'); }
    }
    await page.click('#play'); await status(page, 'Playing');
    await page.waitForFunction(() => window.__scspMeter.read().peak > .0001);
    await page.waitForFunction(() => !!document.getElementById('state').textContent);
    if (lesson === '01-pcm') {
      await page.selectOption('#slot','0');
      // The initial primary preset is also audible at level 7. Wait for this
      // lesson's sample, so an old pre-edit snapshot cannot satisfy the test.
      let state = await waitState(page, () => {
        const slot=JSON.parse(document.getElementById('state').textContent || '{}').slots?.[0];
        return slot?.directLevel===7&&slot?.sample?.bits===8&&slot.gate;
      });
      assert.equal(state.slots[0].sample.bits, 8);
      await page.selectOption('#slot','31');
      state = await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[2].gate === true);
      assert.equal(state.slots[2].sample.bits, 16);
      await page.selectOption('#note','A4');
      await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[2].frequencyHz === 440);
      await input(page,'release-rate',18);
      await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[2].envelope.releaseRate === 18);
      await page.click('#retrigger'); await page.click('#release');
      await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[2].gate === false);
    } else if (lesson === '02-lfo') {
      await input(page,'speed',24); await input(page,'pitch-depth',6); await input(page,'am-depth',5);
      await page.selectOption('#pitch-wave','1'); await page.selectOption('#am-wave','3');
      await page.check('#hold');
      const state = await waitState(page, () => {
        const slot = JSON.parse(document.getElementById('state').textContent || '{}').slots?.[0];
        return slot?.playingLfo?.reset && slot.playingLfo.frequencyCode === 24 && slot.playingLfo.amplitudeWave === 3;
      });
      assert.equal(state.slots[0].gate,true); assert.equal(state.slots[0].playingLfo.pitchDepth,6);
      await page.uncheck('#hold');
      await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[0].playingLfo?.reset === false);
    } else {
      await page.click('#dry');
      await waitState(page, () => JSON.parse(document.getElementById('state').textContent || '{}').slots?.[1].playingModulation?.depth === 0);
      await page.click('#fm'); await page.selectOption('#offset','31'); await page.check('#audible-helper');
      await input(page,'helper-tl',16);
      const state = await waitState(page, () => {
        const slots = JSON.parse(document.getElementById('state').textContent || '{}').slots;
        return slots?.[1].playingModulation?.depth === 9 && slots[1].playingModulation.xOffset === 31 && slots[0].directLevel === 7 && slots[0].totalLevel === 16;
      });
      assert.equal(state.slots[1].gate,true); assert.equal(state.slots[0].gate,true);
      // The default runtime also owns its original init sample; these are additional.
      assert.equal(state.samples.length,3); assert.equal(state.slots[1].sample.modulationDepth,12);
    }
    await page.click('#stop'); const meter = await stopped(page); assert(meter.peak > .0001);
    // Editable source really runs, then natural completion closes every context.
    const source = await page.locator('#code').inputValue();
    await page.locator('#code').fill(source.replace('await sleep(20);', "console.log('EDITED_SCSP_CODE'); await sleep(0.6);"));
    await page.evaluate(() => window.__scspMeter.reset());
    await page.click('#play'); await status(page,'Finished.');
    assert.match(await page.locator('#detail').textContent(), /EDITED_SCSP_CODE/);
    await page.waitForFunction(() => window.__scspMeter.read().states.every(state => state === 'closed'));
    assert((await page.evaluate(() => window.__scspMeter.read())).peak > .0001);
    assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
    return {lesson,execution,rms:meter.peak,liveControls:true,editableCode:true,closed:true};
  } finally { await bounded(page.close(),'close SCSP lesson'); }
}

async function checkRawPcm(browser, base) {
  const page = await monitoredPage(browser,base);
  try {
    await page.goto(base);
    return await bounded(page.evaluate(async base => {
      const [{Scsp},{ScspSynth},{prepareScspPCM},{default:moduleFactory}] = await Promise.all([
        import(base+'vendor/tetorica-fm2612/scsp.js'),import(base+'vendor/tetorica-fm2612/scspsynth.js'),
        import(base+'vendor/tetorica-fm2612/scsp_sample.js'),import(base+'vendor/tetorica-fm2612/generated/scsp_wasm.js'),
      ]);
      const response = await fetch(base+'vendor/tetorica-fm2612/generated/scsp_wasm.wasm');
      if (!response.ok) throw new Error('SCSP WASM missing');
      const core = await Scsp.create({moduleFactory,moduleOptions:{wasmBinary:await response.arrayBuffer()}});
      const synth = new ScspSynth(core);
      const check = (condition,message) => { if (!condition) throw new Error(message); };
      const difference = (a,b) => a.reduce((maximum,value,i)=>Math.max(maximum,Math.abs(value-b[i])),0);
      const peak = values => values.reduce((maximum,value)=>{check(Number.isFinite(value),'Non-finite PCM');return Math.max(maximum,Math.abs(value));},0);
      try {
        const rate=28160,length=128,audio={sampleRate:rate,channels:[Float32Array.from({length},(_,i)=>.32*Math.sin(i*Math.PI/64))]};
        const outputs=[];
        for (const bits of [8,16]) {
          const draft=prepareScspPCM(audio,{endSeconds:length/rate,sourceSampleRate:rate,rootNote:'A3',bits});
          check(draft.pcm instanceof (bits===8?Int8Array:Int16Array),'Signed PCM format');
          const sample=synth.loadPCM(draft.pcm,{baseFrequencyHz:220,sourceSampleRate:rate,loopStartSamples:0});
          synth.stopVoices();synth.setPreset(31,{sample,totalLevel:24});synth.noteOn(31,'A3');
          outputs.push(synth.generateStereo(8192).left);check(peak(outputs.at(-1))>.01,'Physical slot31 must sound');
        }
        const pcmDelta=difference(...outputs);check(pcmDelta>1e-6&&pcmDelta<.03,'PCM8 quantization must differ from PCM16');
        const wave=synth.loadPCM(Int16Array.from({length:64},(_,i)=>Math.round(8192*Math.sin(i*Math.PI/32))),{baseFrequencyHz:44100/64,loopStartSamples:0,modulationDepth:12});
        const startLfo = lfo => {synth.stopVoices();synth.setPreset(0,{sample:wave,totalLevel:24,lfo});synth.noteOn(0,'A3');return synth.generateStereo(8192).left;};
        const dry=startLfo({frequencyCode:20,pitchDepth:0,amplitudeDepth:0,reset:false});
        const lfoDeltas=[];
        for (let wave=0;wave<4;wave++) {
          const wet=startLfo({frequencyCode:20,pitchDepth:6,amplitudeDepth:6,pitchWave:wave,amplitudeWave:wave,reset:false});
          const delta=difference(dry,wet);check(delta>.001,'Every LFO waveform must affect PCM');lfoDeltas.push(delta);
        }
        synth.setLfo(0,{reset:true});check((core.read(18)&0x8000)!==0,'Reset must hold');
        check(synth.getState().slots[0].gate,'Live reset must retain Gate');
        synth.setLfo(0,{reset:false});check((core.read(18)&0x8000)===0,'Reset must resume');
        const startFm = (depth,audible=0) => {
          synth.stopVoices();synth.setPreset(0,{sample:wave,totalLevel:0,directLevel:audible,lfo:{pitchDepth:0,amplitudeDepth:0}});
          synth.setPreset(1,{sample:wave,totalLevel:24,modulation:{depth,xOffset:63,yOffset:63}});
          synth.noteOn(0,'A4');synth.noteOn(1,'A3');return synth.generateStereo(8192).left;
        };
        const fmDry=startFm(0),fmWet=startFm(9),fmDelta=difference(fmDry,fmWet);
        check(fmDelta>.001,'Sound-stack depth must affect carrier PCM with muted helper');
        const audible=startFm(9,7);check(difference(fmWet,audible)>.001,'Helper direct output must be independently audible');
        const before=startFm(12);
        synth.loadPCM(new Int16Array(1000).fill(32767),{rootNote:'A4'});
        const after=startFm(12);check(difference(before,after)===0,'Guarded sample must not read neighbor allocation');
        const state=JSON.stringify(synth.getState());let rejected=false;
        try{synth.setModulation(1,{depth:13});}catch{rejected=true;}
        check(rejected&&JSON.stringify(synth.getState())===state,'Unsafe depth must fail before mutation');
        synth.stopVoices();check(peak(synth.generateStereo(1024).left)===0,'Stop must silence PCM');
        return {sampleRate:44100,pcmDelta,lfoDeltas,fmDelta,retainedSampleIsolation:true,unsafeDepthRejected:true,stopSilence:true};
      } finally {synth.dispose();}
    },base),'raw SCSP PCM');
  } finally {await bounded(page.close(),'close raw SCSP page');}
}

async function checkNodeWav() {
  const temporary=await mkdtemp(join(tmpdir(),'tetorica-scsp-'));
  try {
    const results=[];
    for(const lesson of ['01-pcm','02-lfo','03-modulation']){
      const file=join(temporary,lesson+'.wav');
      await promisify(execFile)(process.execPath,[join(repository,'examples/saturn/scsp',lesson,'node/main.mjs'),file],{cwd:repository,timeout:30000});
      const bytes=await readFile(file);assert.equal(bytes.toString('ascii',0,4),'RIFF');
      assert.equal(bytes.readUInt32LE(24),44100);assert.equal(bytes.readUInt16LE(22),2);assert.equal(bytes.readUInt16LE(34),16);
      let peak=0;for(let i=44;i<bytes.length;i+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(i)));
      assert(peak>100&&peak<32767,`${lesson} peak ${peak}`);results.push({lesson,bytes:bytes.length,peak});
    }
    console.log(JSON.stringify({nodeWav:results}));
  } finally {await rm(temporary,{recursive:true,force:true});}
}
try {
  const dependency=JSON.parse(await readFile(join(repository,'package.json'),'utf8')).dependencies['tetorica-fm2612'];
  const vendor=JSON.parse(await readFile(join(root,'vendor/tetorica-fm2612/package.json'),'utf8'));
  assert.equal(vendor.version,dependency,'Static runtime matches published dependency');
  const results=[];
  if(args.includes('--node-wav'))await checkNodeWav();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const engines=args.includes('--chromium')?{chromium}:args.includes('--webkit')?{webkit}:{chromium,webkit};
  for(const [name,engine]of Object.entries(engines)){
    const browser=await bounded(engine.launch({headless:true,...(name==='chromium'?{args:['--autoplay-policy=no-user-gesture-required']}:{})}),'launch '+name);
    try{
      const raw=await checkRawPcm(browser,base);console.log(JSON.stringify({browser:name,raw}));results.push({browser:name,raw});
      for(const lesson of ['01-pcm','02-lfo','03-modulation'])for(const execution of ['main','worker']){
        const result=await checkLesson(browser,base,lesson,execution);console.log(JSON.stringify({browser:name,...result}));results.push({browser:name,...result});
      }
      console.log(JSON.stringify({browser:name,passed:true,subpath:true,mutedPhysicalOutput:true}));
    }finally{await bounded(browser.close(),'close '+name);}
  }
  assert.deepEqual(failedRequests,[],'No missing static assets');assert.deepEqual(externalRequests,[],'No external runtime fallback');
  if(output){const file=resolve(output);await mkdir(dirname(file),{recursive:true});await writeFile(file,JSON.stringify({passed:true,packageVersion:vendor.version,physicalOutputMuted:true,listeningPerformed:false,results,assets:Object.fromEntries([...served].sort(([a],[b])=>a.localeCompare(b)))},null,2)+'\n');}
  console.log('PASS '+results.filter(result=>result.lesson).length+' SCSP example/browser/execution cases and actual PCM proofs');
} finally {server.closeIdleConnections?.();server.closeAllConnections?.();if(server.listening)await new Promise(resolve=>server.close(resolve));}

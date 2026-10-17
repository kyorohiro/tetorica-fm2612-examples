// Exercise the installed npm runtime through the built pages, under a subpath.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), prefix = '/examples-site/';
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') {response.writeHead(204).end(); return;}
    if (!pathname.startsWith(prefix)) throw Error('Outside site');
    let file = resolve(dist, pathname.slice(prefix.length));
    const local = relative(dist, file);
    if (local === '..' || local.startsWith('..' + sep)) throw Error('Outside dist');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch (error) {response.writeHead(404).end(String(error));}
});

function installMeter() {
  const connect = AudioNode.prototype.connect, observed = new WeakMap(), meters = [], failures = [];
  AudioNode.prototype.connect = function(destination, ...args) {
    const result = connect.call(this, destination, ...args);
    if (destination === this.context.destination) {
      let meter = observed.get(this);
      if (!meter) {
        const analyser = this.context.createAnalyser(), silent = this.context.createGain();
        analyser.fftSize = 2048; silent.gain.value = 0;
        connect.call(analyser, silent); connect.call(silent, destination);
        meter = {context:this.context, analyser, pcm:new Float32Array(2048), peak:0};
        observed.set(this, meter); meters.push(meter);
      }
      // FX setup can disconnect/reconnect an existing output node. Reattach the
      // observation branch too; AudioNode.connect deduplicates identical edges.
      connect.call(this, meter.analyser);
    }
    return result;
  };
  function sample() {
    for (const meter of meters) {
      if (meter.context.state !== 'running') continue;
      meter.analyser.getFloatTimeDomainData(meter.pcm);
      let energy = 0;
      for (const value of meter.pcm) {
        if (!Number.isFinite(value)) failures.push('Non-finite output');
        energy += value * value;
      }
      meter.peak = Math.max(meter.peak, Math.sqrt(energy / meter.pcm.length));
    }
  }
  setInterval(sample, 20);
  window.__snesMeter = {
    reset() {for (const meter of meters) meter.peak = 0;},
    read() {sample(); return {peak:Math.max(0, ...meters.map(m=>m.peak)), states:meters.map(m=>m.context.state), failures:[...failures]};},
  };
}
async function open(browser, base, path) {
  const page = await browser.newPage({serviceWorkers:'block'}), errors = [], missing = [];
  page.setDefaultTimeout(20000);
  page.on('pageerror', error=>errors.push(error.message));
  page.on('response', response=>{if(response.status()===404)missing.push(response.url());});
  await page.addInitScript(installMeter);
  await page.goto(base + path);
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('Ready.'));
  return {page, clean() {assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);}};
}
async function status(page, start) {
  await page.waitForFunction(start=>document.querySelector('#status').textContent.startsWith(start), start).catch(async error=>{
    throw new Error(`Expected ${start}; got ${await page.locator('#status').textContent()}`,{cause:error});
  });
}
async function output(page, audible, closed = true) {
  if (closed) await page.waitForFunction(()=>window.__snesMeter.read().states.every(state=>state==='closed'));
  const result = await page.evaluate(()=>window.__snesMeter.read());
  assert.deepEqual(result.failures,[]);
  if (audible) assert(result.peak>.001,JSON.stringify(result));
  else assert(result.peak<.000001,JSON.stringify(result));
  return result.peak;
}
async function gateWasm(page) {
  let release, requested;
  const held = new Promise(resolve=>{release=resolve;}), started = new Promise(resolve=>{requested=resolve;});
  await page.route('**/generated/spc_wasm.wasm',async route=>{requested();await held;await route.continue();});
  return {release, async wait() {
    let timer;
    try {await Promise.race([started,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('SPC WASM was not requested')),20000);})]);}
    finally {clearTimeout(timer);}
  }};
}
async function checkBrr(browser, base, execution) {
  const audit = await open(browser,base,'examples/snes/01-brr-notes/web/index.html'), {page}=audit;
  const gate = await gateWasm(page);
  try {
    await page.selectOption('#execution',execution);
    const original = await page.locator('#code').inputValue();
    await page.click('#play'); await gate.wait();
    await page.click('#stop'); gate.release();
    await status(page,'Stopped.'); await output(page,false);
    await page.evaluate(()=>window.__snesMeter.reset());
    await page.click('#play'); await status(page,'Finished.');
    const rms = await output(page,true);
    const edited = original.slice(0,original.indexOf("for (const note of ['C4'")) + `
snes.noteOn(0,'A4');
console.log('EDITED_SNES_CODE');
await sleep(0.4);
snes.allNotesOff();
// Allow the default Worker lookahead and final KOFF to reach the output.
await sleep(0.7);`;
    await page.locator('#code').fill(edited);
    await page.evaluate(()=>window.__snesMeter.reset());
    await page.click('#play'); await status(page,'Finished.');
    assert.match(await page.locator('#detail').textContent(),/EDITED_SNES_CODE/);
    const editedRms = await output(page,true);
    assert(await page.locator('#execution').isEnabled());
    audit.clean(); return {execution,rms,editedRms,stoppedInitialization:true};
  } finally {gate.release();await page.close();}
}
async function checkSpc(browser, base) {
  const audit = await open(browser,base,'examples/snes/02-spc-player/web/index.html'), {page}=audit;
  const gate = await gateWasm(page);
  try {
    await page.click('#play'); await gate.wait();
    await page.click('#stop'); gate.release();
    await status(page,'Stopped.'); await output(page,false);
    await page.click('#play'); await status(page,'Playing.');
    await page.waitForFunction(()=>window.__snesMeter.read().peak>.001);
    const rms=await output(page,true,false);
    assert.match(await page.locator('#detail').textContent(),/32,000 Hz/);
    await page.locator('#volume').evaluate(input=>{input.value='0';input.dispatchEvent(new Event('input'));});
    await page.waitForTimeout(100); await page.evaluate(()=>window.__snesMeter.reset());
    await page.waitForTimeout(100); await output(page,false,false);
    await page.click('#pause'); await status(page,'Paused.');
    const paused=await page.locator('#position').textContent();
    await page.waitForTimeout(200); assert.equal(await page.locator('#position').textContent(),paused);
    await page.locator('#volume').evaluate(input=>{input.value='35';input.dispatchEvent(new Event('input'));});
    await page.click('#pause'); await status(page,'Playing.');
    await page.waitForFunction(()=>window.__snesMeter.read().peak>.001);
    await page.click('#stop'); await status(page,'Stopped.');
    await page.waitForFunction(()=>window.__snesMeter.read().states.every(state=>state==='closed'));
    assert.equal(await page.locator('#position').textContent(),'0.00 s');
    await page.locator('#seconds').fill('0.3');
    await page.evaluate(()=>window.__snesMeter.reset());
    await page.click('#play'); await status(page,'Finished.'); await output(page,true);
    await page.locator('#file').setInputFiles({name:'invalid.spc',mimeType:'application/octet-stream',buffer:Buffer.from('invalid')});
    await page.click('#play');
    await page.waitForFunction(()=>!document.querySelector('#play').disabled && /Error/.test(document.querySelector('#status').textContent));
    await page.waitForFunction(()=>window.__snesMeter.read().states.every(state=>state==='closed'));
    await page.locator('#file').setInputFiles(join(dist,'examples/snes/02-spc-player/assets/original.spc'));
    await page.locator('#seconds').fill('0.5');
    await page.evaluate(()=>window.__snesMeter.reset());
    await page.click('#play'); await status(page,'Finished.'); await output(page,true);
    audit.clean();return {rms,stoppedInitialization:true,volume:true,pauseResume:true,boundedFinish:true,invalidFileRecovery:true};
  } finally {gate.release();await page.close();}
}

try {
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const engines=process.argv.includes('--chromium')?{chromium}:process.argv.includes('--webkit')?{webkit}:{chromium,webkit};
  for (const [name,engine] of Object.entries(engines)) {
    const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--autoplay-policy=no-user-gesture-required']}:{})});
    try {
      const catalog=await browser.newPage();await catalog.goto(base);
      await catalog.locator('a[href="./examples/snes/01-brr-notes/web/index.html"]').waitFor();
      await catalog.locator('a[href="./examples/snes/02-spc-player/web/index.html"]').waitFor();await catalog.close();
      const brr=[];for(const execution of ['main','worker']){const result=await checkBrr(browser,base,execution);brr.push(result);console.log(JSON.stringify({browser:name,brr:result}));}
      const spc=await checkSpc(browser,base);
      console.log(JSON.stringify({browser:name,passed:true,subpath:true,brr,spc}));
    } finally {await browser.close();}
  }
} finally {await new Promise(resolve=>server.close(resolve));}

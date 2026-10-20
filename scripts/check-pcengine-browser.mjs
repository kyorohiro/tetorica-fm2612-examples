// Exercise the installed public npm runtime through built pages under a subpath.
// Build first. Optional: --chromium, --webkit, --case=wave|noise|lfo.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), prefix = '/examples-site/';
const cases = {
  wave: 'pc-engine/wave/01-waveform',
  noise: 'pc-engine/noise/01-noise',
  lfo: 'pc-engine/lfo/01-modulation',
};
const selectedCase = process.argv.find(argument => argument.startsWith('--case='))?.slice(7);
if (selectedCase) assert(Object.hasOwn(cases, selectedCase), `Unknown case ${selectedCase}`);
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
    if (!pathname.startsWith(prefix)) throw Error('Outside site');
    let file = resolve(dist, pathname.slice(prefix.length));
    const local = relative(dist, file);
    if (local === '..' || local.startsWith('..' + sep)) throw Error('Outside dist');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch (error) { response.writeHead(404).end(String(error)); }
});

function installOutputAudit() {
  const contexts = [], names = [], meters = [], failures = [], observed = new WeakMap();
  const NativeContext = window.AudioContext;
  window.AudioContext = new Proxy(NativeContext, {
    construct(Target, args) { const context = Reflect.construct(Target, args); contexts.push(context); return context; },
  });
  if (window.webkitAudioContext === NativeContext) window.webkitAudioContext = window.AudioContext;
  const NativeWorklet = window.AudioWorkletNode;
  window.AudioWorkletNode = new Proxy(NativeWorklet, {
    construct(Target, args) { const node = Reflect.construct(Target, args); names.push(args[1]); return node; },
  });
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(destination, ...args) {
    const result = connect.call(this, destination, ...args);
    if (destination === this.context.destination) {
      let meter = observed.get(this);
      if (!meter) {
        const splitter = this.context.createChannelSplitter(2), silent = this.context.createGain();
        silent.gain.value = 0;
        const analysers = [0, 1].map(channel => {
          const analyser = this.context.createAnalyser(); analyser.fftSize = 4096;
          connect.call(splitter, analyser, channel); connect.call(analyser, silent);
          return analyser;
        });
        connect.call(silent, destination);
        meter = {context:this.context, splitter, analysers, pcm:[new Float32Array(4096), new Float32Array(4096)], peak:[0, 0], frequency:[0, 0], leftOnly:0, rightOnly:0};
        observed.set(this, meter); meters.push(meter);
      }
      // Reattach after output disconnect/reconnect; identical edges are deduplicated.
      connect.call(this, meter.splitter);
    }
    return result;
  };
  function frequency(pcm, sampleRate) {
    const crossings = [];
    for (let index = 1; index < pcm.length; index++) {
      if (pcm[index - 1] <= 0 && pcm[index] > 0) crossings.push(index - 1 - pcm[index - 1] / (pcm[index] - pcm[index - 1]));
    }
    return crossings.length > 2 ? sampleRate * (crossings.length - 1) / (crossings.at(-1) - crossings[0]) : 0;
  }
  function sample() {
    for (const meter of meters) {
      if (meter.context.state !== 'running') continue;
      const rms = meter.analysers.map((analyser, channel) => {
        const pcm = meter.pcm[channel]; analyser.getFloatTimeDomainData(pcm);
        let energy = 0;
        for (const value of pcm) {
          if (!Number.isFinite(value) && !failures.includes('Non-finite output')) failures.push('Non-finite output');
          energy += value * value;
        }
        const level = Math.sqrt(energy / pcm.length);
        meter.peak[channel] = Math.max(meter.peak[channel], level);
        if (level > 0.001) meter.frequency[channel] = frequency(pcm, meter.context.sampleRate);
        return level;
      });
      if (rms[0] > 0.001 && rms[1] < rms[0] * 0.1) meter.leftOnly++;
      if (rms[1] > 0.001 && rms[0] < rms[1] * 0.1) meter.rightOnly++;
    }
  }
  setInterval(sample, 20);
  window.__pcengineOutput = {
    reset() { for (const meter of meters) { meter.peak = [0, 0]; meter.frequency = [0, 0]; meter.leftOnly = meter.rightOnly = 0; } },
    read() {
      sample();
      return {states:contexts.map(context => context.state), names:[...names], failures:[...failures], meters:meters.map(({peak, frequency, leftOnly, rightOnly}) => ({peak:[...peak], frequency:[...frequency], leftOnly, rightOnly}))};
    },
  };
}

async function until(page, predicate, message, timeout = 20000) {
  // Keep asynchronous browser RPCs in Node; never poll async waitForFunction callbacks.
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw Error(`${message}; status=${await page.locator('#status').textContent()}; detail=${await page.locator('#detail').textContent()}`);
}
async function status(page, expected) {
  await until(page, async () => (await page.locator('#status').textContent()).startsWith(expected), `Expected ${expected}`);
}
async function output(page, {audible = true, closed = true, pan = false, pitch = false} = {}) {
  if (closed) await until(page, () => page.evaluate(() => window.__pcengineOutput.read().states.every(state => state === 'closed')), 'Audio contexts did not close');
  const result = await page.evaluate(() => window.__pcengineOutput.read());
  assert.deepEqual(result.failures, []);
  assert(result.states.length > 0, 'No AudioContext was created');
  const peak = Math.max(0, ...result.meters.flatMap(meter => meter.peak));
  if (audible) {
    assert(peak > 0.001, `Silent final output: ${JSON.stringify(result)}`);
    assert(result.names.includes('tetorica-huc6280'), 'HuC6280 AudioWorklet did not run');
  } else assert(peak < 0.000001, `Cancelled initialization produced audio: ${JSON.stringify(result)}`);
  assert(result.names.every(name => ['tetorica-huc6280', 'tetorica-native-fx'].includes(name)), `Unexpected hidden chip/worklet: ${result.names}`);
  if (pan) {
    assert(result.meters.some(meter => meter.leftOnly > 0), `No left-only audio: ${JSON.stringify(result)}`);
    assert(result.meters.some(meter => meter.rightOnly > 0), `No right-only audio: ${JSON.stringify(result)}`);
  }
  if (pitch) {
    const frequencies = result.meters.filter(meter => Math.max(...meter.peak) > 0.001).flatMap(meter => meter.frequency).filter(value => value > 0);
    assert(frequencies.some(value => Math.abs(value - 440) < 12), `Expected A4 near 440 Hz; observed ${frequencies}`);
  }
  return {peak, worklets:result.names, ...(pitch ? {frequency:result.meters.flatMap(meter => meter.frequency).filter(Boolean)} : {})};
}
async function gateWasm(page) {
  let release, requested;
  const held = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { requested = resolve; });
  await page.route('**/generated/huc6280_wasm.wasm', async route => { requested(); await held; await route.continue(); });
  return {release, async wait() {
    let timer;
    try { await Promise.race([started, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('HuC6280 WASM was not requested')), 20000); })]); }
    finally { clearTimeout(timer); }
  }};
}
function editedSource(seconds) {
  return `pce.initialize();
const wave = Array.from({length:32}, (_, i) => Math.round(15.5 + 15.5 * Math.sin(2 * Math.PI * i / 32)));
pce.setLfo({frequency:0, depth:0});
pce.allNotesOff();
pce.setWaveform(0, wave);
pce.setVolume(0, 26);
pce.setPan(0, 15, 15);
await mixer.set(pce.id, {volume:0.5});
pce.noteOn(0, 'A4');
console.log('EDITED_PCENGINE_SOURCE');
await sleep(${seconds});
pce.allNotesOff();
await sleep(0.8);`;
}
async function checkExample(browser, base, name, path, execution) {
  const page = await browser.newPage({serviceWorkers:'block'}), errors = [], missing = [];
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.stack ?? error.message));
  page.on('response', response => { if (response.status() === 404) missing.push(response.url()); });
  await page.addInitScript(installOutputAudit);
  const gate = await gateWasm(page);
  try {
    await page.goto(`${base}examples/${path}/web/index.html`);
    await status(page, 'Ready.');
    assert.equal(await page.locator('#execution').inputValue(), 'worker');
    assert.deepEqual(await page.evaluate(() => window.__pcengineOutput.read().states), [], 'Opening the page started audio');
    await page.selectOption('#execution', execution);
    const original = await page.locator('#code').inputValue();
    await page.locator('#code').fill(`console.log('CANCELLED_SOURCE_EXECUTED');\n${original}`);
    await page.click('#play'); await gate.wait();
    await page.click('#stop'); gate.release();
    await status(page, 'Stopped.'); await output(page, {audible:false});
    assert.doesNotMatch(await page.locator('#detail').textContent(), /CANCELLED_SOURCE_EXECUTED/);

    await page.locator('#code').fill(original);
    await page.evaluate(() => window.__pcengineOutput.reset());
    await page.click('#play'); await status(page, 'Finished.');
    const originalOutput = await output(page, {pan:name !== 'lfo'});

    await page.locator('#code').fill(editedSource(30));
    await page.evaluate(() => window.__pcengineOutput.reset());
    await page.click('#play'); await status(page, 'Playing');
    await until(page, () => page.evaluate(() => window.__pcengineOutput.read().meters.some(meter => Math.max(...meter.peak) > 0.001)), 'Edited A4 did not produce output');
    await page.click('#stop'); await status(page, 'Stopped.');
    await output(page);

    await page.locator('#code').fill(editedSource(0.6));
    await page.evaluate(() => window.__pcengineOutput.reset());
    await page.click('#play'); await status(page, 'Finished.');
    assert.match(await page.locator('#detail').textContent(), /EDITED_PCENGINE_SOURCE/);
    const editedOutput = await output(page, {pitch:true});
    assert(await page.locator('#execution').isEnabled());
    assert(await page.locator('#play').isEnabled());
    assert(await page.locator('#stop').isDisabled());
    assert.deepEqual(errors, [], 'Unexpected page errors');
    assert.deepEqual(missing, [], 'Missing built-site assets');
    return {example:name, execution, originalOutput, editedOutput, stoppedInitialization:true, stoppedPlayback:true, rerun:true};
  } finally { gate.release(); await page.close(); }
}

try {
  for (const path of Object.values(cases)) await stat(join(dist, 'examples', path, 'web/index.html'));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium, webkit};
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless:true, ...(name === 'chromium' ? {args:['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      const catalog = await browser.newPage(); await catalog.goto(base);
      for (const path of Object.values(cases)) await catalog.locator(`a[href="./examples/${path}/web/index.html"]`).waitFor();
      await catalog.close();
      for (const [caseName, path] of Object.entries(cases)) {
        if (selectedCase && caseName !== selectedCase) continue;
        for (const execution of ['main', 'worker']) console.log(JSON.stringify({browser:name, passed:true, subpath:true, ...await checkExample(browser, base, caseName, path, execution)}));
      }
    } finally { await browser.close(); }
  }
} finally { if (server.listening) await new Promise(resolve => server.close(resolve)); }

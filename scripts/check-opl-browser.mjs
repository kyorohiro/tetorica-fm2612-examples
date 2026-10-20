// Build first: exercise the installed npm OPL runtime through the published pages.
// Optional: --chromium, --webkit, --case=models|operators|rhythm|four-op,
// --chip=ym3526|ym3812|y8950|ymf262 (limits the models case only).
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), prefix = '/examples-site/';
const chips = ['ym3526', 'ym3812', 'y8950', 'ymf262'];
const cases = {
  models: {path:'opl/fm/01-models', chips},
  operators: {path:'opl2/fm/01-operators', chips:['ym3812']},
  rhythm: {path:'opl2/rhythm/01-drums', chips:['ym3812']},
  'four-op': {path:'opl3/fm/01-four-operators', chips:['ymf262'], pan:true},
};
const selectedCase = process.argv.find(argument => argument.startsWith('--case='))?.slice(7);
const selectedChip = process.argv.find(argument => argument.startsWith('--chip='))?.slice(7);
if (selectedCase) assert(Object.hasOwn(cases, selectedCase), `Unknown case ${selectedCase}`);
if (selectedChip) assert(chips.includes(selectedChip), `Unknown chip ${selectedChip}`);
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

/** Observe the final output without modifying the example's audible signal. */
function installOutputAudit() {
  const contexts = [], names = [], meters = [], failures = [], observed = new WeakMap();
  const NativeContext = window.AudioContext;
  window.AudioContext = new Proxy(NativeContext, {
    construct(Target, args) { const context = Reflect.construct(Target, args); contexts.push(context); return context; },
  });
  if (window.webkitAudioContext === NativeContext) window.webkitAudioContext = window.AudioContext;
  const NativeWorklet = window.AudioWorkletNode;
  window.AudioWorkletNode = new Proxy(NativeWorklet, {
    construct(Target, args) {
      const node = Reflect.construct(Target, args);
      names.push({processor:args[1], chip:args[2]?.processorOptions?.name});
      return node;
    },
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
        meter = {context:this.context, splitter, analysers, pcm:[new Float32Array(4096), new Float32Array(4096)], peak:[0, 0], maxAbs:[0, 0], frequency:[0, 0], leftOnly:0, rightOnly:0};
        observed.set(this, meter); meters.push(meter);
      }
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
          meter.maxAbs[channel] = Math.max(meter.maxAbs[channel], Math.abs(value));
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
  window.__oplOutput = {
    reset() { for (const meter of meters) { meter.peak = [0, 0]; meter.maxAbs = [0, 0]; meter.frequency = [0, 0]; meter.leftOnly = meter.rightOnly = 0; } },
    read() {
      sample();
      return {states:contexts.map(context => context.state), names:[...names], failures:[...failures], meters:meters.map(({peak, maxAbs, frequency, leftOnly, rightOnly}) => ({peak:[...peak], maxAbs:[...maxAbs], frequency:[...frequency], leftOnly, rightOnly}))};
    },
  };
}

async function until(page, predicate, message, timeout = 25000) {
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
async function output(page, chip, {audible = true, closed = true, pan = false, pitch = false} = {}) {
  if (closed) await until(page, () => page.evaluate(() => window.__oplOutput.read().states.every(state => state === 'closed')), 'Audio contexts did not close');
  const result = await page.evaluate(() => window.__oplOutput.read());
  assert.deepEqual(result.failures, []);
  const peak = Math.max(0, ...result.meters.flatMap(meter => meter.peak));
  const maxAbs = Math.max(0, ...result.meters.flatMap(meter => meter.maxAbs));
  assert(maxAbs <= 1.000001, `Clipped final output: ${JSON.stringify(result)}`);
  assert(result.names.every(({processor, chip:name}) => processor === 'tetorica-soundchip' && name === chip), `Unexpected hidden chip/worklet: ${JSON.stringify(result.names)}`);
  if (audible) {
    assert(result.states.length > 0, 'No AudioContext was created');
    assert(peak > 0.001, `Silent final output: ${JSON.stringify(result)}`);
    assert(result.names.some(({processor, chip:name}) => processor === 'tetorica-soundchip' && name === chip), 'Expected OPL AudioWorklet did not run');
  } else assert(peak < 0.000001, `Cancelled initialization produced audio: ${JSON.stringify(result)}`);
  if (pan) {
    assert(result.meters.some(meter => meter.leftOnly > 0), `No left-only audio: ${JSON.stringify(result)}`);
    assert(result.meters.some(meter => meter.rightOnly > 0), `No right-only audio: ${JSON.stringify(result)}`);
  }
  const frequencies = result.meters.flatMap(meter => meter.frequency.filter((_value, channel) => meter.peak[channel] > 0.001));
  if (pitch) {
    assert(result.states.some(state => state === 'running'), 'Steady tuning must be measured while audio is running');
    assert(frequencies.length >= 2, `Expected audible A4 on both channels; observed ${JSON.stringify(result)}`);
    assert(frequencies.every(value => Number.isFinite(value) && Math.abs(value - 440) <= 2), `Expected steady A4 within 2 Hz on every audible channel; observed ${frequencies}`);
  }
  return {peak, maxAbs, worklets:result.names, ...(pitch ? {frequency:frequencies} : {})};
}
async function gateWasm(page, chip) {
  let release, requested;
  const held = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { requested = resolve; });
  await page.route(`**/generated/${chip}_wasm.wasm*`, async route => {
    requested(); await held;
    // The Stop request may already have aborted the fetch while it was gated.
    try { await route.continue(); } catch (error) { if (!/closed|cancel|abort|Target/i.test(String(error))) throw error; }
  });
  return {release, async wait() {
    let timer;
    try { await Promise.race([started, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`${chip} WASM was not requested`)), 20000); })]); }
    finally { clearTimeout(timer); }
  }};
}
function editedSource(seconds) {
  return `opl.initialize();
opl.setPreset(0, OPL_PRESETS.sine);
opl.noteOn(0, 'A4');
console.log('EDITED_OPL_SOURCE');
await sleep(${seconds});
opl.allNotesOff();
await sleep(0.2);`;
}
async function checkExample(browser, base, name, example, chip) {
  const page = await browser.newPage({serviceWorkers:'block'}), errors = [], missing = [];
  page.setDefaultTimeout(25000);
  page.on('pageerror', error => errors.push(error.stack ?? error.message));
  page.on('response', response => { if (response.status() === 404) missing.push(response.url()); });
  await page.addInitScript(installOutputAudit);
  const gate = await gateWasm(page, chip);
  try {
    await page.goto(`${base}examples/${example.path}/web/index.html`);
    await status(page, 'Ready.');
    assert.equal(await page.locator('#execution').count(), 0, 'These examples use the generic Worklet endpoint without a Playground execution selector');
    assert.deepEqual(await page.evaluate(() => window.__oplOutput.read().states), [], 'Opening the page started audio');
    if (name === 'models') {
      assert.equal(await page.locator('#chip').inputValue(), 'ym3812');
      assert.deepEqual(await page.locator('#chip option').evaluateAll(options => options.map(option => option.value)), chips);
      await page.selectOption('#chip', chip);
    }
    const original = await page.locator('#code').inputValue();
    await page.locator('#code').fill(`globalThis.__cancelledOplSource = true;\n${original}`);
    await page.click('#play'); await gate.wait();
    await page.click('#stop'); gate.release();
    await status(page, 'Stopped.'); await output(page, chip, {audible:false});
    assert.equal(await page.evaluate(() => window.__cancelledOplSource), undefined, 'Cancelled source ran after initialization');

    await page.locator('#code').fill(original);
    await page.evaluate(() => window.__oplOutput.reset());
    await page.click('#play'); await status(page, 'Finished.');
    const originalOutput = await output(page, chip, {pan:example.pan});

    await page.locator('#code').fill(editedSource(30));
    await page.evaluate(() => window.__oplOutput.reset());
    await page.click('#play'); await status(page, 'Playing');
    await until(page, () => page.evaluate(() => window.__oplOutput.read().meters.some(meter => Math.max(...meter.peak) > 0.001)), 'Edited A4 did not produce output');
    // A 4096-frame analyser needs at most 93 ms at 44.1 kHz. Wait beyond
    // the attack before estimating a held note; release/fade windows include
    // low-level chip quantization and are unsuitable for a tuning assertion.
    await new Promise(resolve => setTimeout(resolve, 250));
    const steadyOutput = await output(page, chip, {closed:false, pitch:true});
    await page.click('#stop'); await status(page, 'Stopped.');
    await output(page, chip);

    await page.locator('#code').fill(editedSource(0.7));
    await page.evaluate(() => window.__oplOutput.reset());
    await page.click('#play'); await status(page, 'Finished.');
    assert.match(await page.locator('#detail').textContent(), /EDITED_OPL_SOURCE/);
    const editedOutput = await output(page, chip);
    assert(await page.locator('#play').isEnabled());
    assert(await page.locator('#stop').isDisabled());
    assert(await page.locator('#code').isEnabled());
    if (name === 'models') assert(await page.locator('#chip').isEnabled());
    assert.deepEqual(errors, [], 'Unexpected page errors');
    assert.deepEqual(missing, [], 'Missing built-site assets');
    return {example:name, chip, originalOutput, steadyOutput, editedOutput, stoppedInitialization:true, stoppedPlayback:true, rerun:true};
  } finally { gate.release(); await page.close(); }
}

try {
  for (const {path} of Object.values(cases)) await stat(join(dist, 'examples', path, 'web/index.html'));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium, webkit};
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless:true, ...(name === 'chromium' ? {args:['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      const catalog = await browser.newPage(); await catalog.goto(base);
      for (const {path} of Object.values(cases)) await catalog.locator(`a[href="./examples/${path}/web/index.html"]`).waitFor();
      await catalog.close();
      for (const [caseName, example] of Object.entries(cases)) {
        if (selectedCase && caseName !== selectedCase) continue;
        for (const chip of example.chips) {
          if (caseName === 'models' && selectedChip && chip !== selectedChip) continue;
          console.log(JSON.stringify({browser:name, passed:true, subpath:true, ...await checkExample(browser, base, caseName, example, chip)}));
        }
      }
    } finally { await browser.close(); }
  }
} finally { if (server.listening) await new Promise(resolve => server.close(resolve)); }

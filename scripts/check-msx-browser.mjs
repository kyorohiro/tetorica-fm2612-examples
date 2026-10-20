// Build first. Check the installed package from a repository subpath.
// Optional: --chromium, --webkit, --case=tone|envelope|instruments|rhythm|duet|audio.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), prefix = '/examples-site/';
const cases = {
  tone: {path:'msx/ay/01-tone-noise', chips:['ay8910'], tune:['ay']},
  envelope: {path:'msx/ay/02-envelope', chips:['ay8910'], tune:['ay']},
  instruments: {path:'master-system/opll/01-instruments', chips:['ym2413','segapsg'], tune:['opll']},
  rhythm: {path:'master-system/opll/02-rhythm', chips:['ym2413'], tune:['opll']},
  duet: {path:'msx/music/01-duet', chips:['ay8910','ym2413'], tune:['ay','opll'], composite:true},
  audio: {path:'msx-audio/fm/01-three-chips', chips:['ay8910','ym2413','y8950'], tune:['ay','opll','opl'], composite:true},
};
const selected = process.argv.find(value => value.startsWith('--case='))?.slice(7);
if (selected) assert(Object.hasOwn(cases, selected), `Unknown case ${selected}`);
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
    assert(pathname.startsWith(prefix));
    let file = resolve(dist, pathname.slice(prefix.length));
    const local = relative(dist, file);
    assert(local !== '..' && !local.startsWith('..' + sep));
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch (error) { response.writeHead(404).end(String(error)); }
});

// Observe output without changing what is sent to the speakers.
function installOutputAudit() {
  const contexts = [], nodes = [], meters = [], observed = new WeakMap();
  const NativeContext = window.AudioContext, NativeWorklet = window.AudioWorkletNode;
  window.AudioContext = new Proxy(NativeContext, {construct(Target, args) {
    const context = Reflect.construct(Target, args); contexts.push(context); return context;
  }});
  window.AudioWorkletNode = new Proxy(NativeWorklet, {construct(Target, args) {
    const node = Reflect.construct(Target, args);
    nodes.push({processor:args[1], chip:args[2]?.processorOptions?.name ?? args[2]?.processorOptions?.chip});
    return node;
  }});
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(destination, ...args) {
    const result = connect.call(this, destination, ...args);
    if (destination === this.context.destination && !observed.has(this)) {
      const splitter = this.context.createChannelSplitter(2), silent = this.context.createGain();
      silent.gain.value = 0;
      const analysers = [0, 1].map(channel => {
        const analyser = this.context.createAnalyser(); analyser.fftSize = 4096;
        connect.call(splitter, analyser, channel); connect.call(analyser, silent); return analyser;
      });
      connect.call(silent, destination); connect.call(this, splitter);
      const meter = {context:this.context, analysers, peak:0, maxAbs:0, finite:true, frequency:[0,0]};
      observed.set(this, meter); meters.push(meter);
    }
    return result;
  };
  function sample() {
    for (const meter of meters) {
      if (meter.context.state !== 'running') continue;
      meter.analysers.forEach((analyser, channel) => {
        const pcm = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(pcm);
        const mean = pcm.reduce((sum, value) => sum + value, 0) / pcm.length;
        let energy = 0; const crossings = [];
        for (let i = 0; i < pcm.length; i++) {
          const value = pcm[i] - mean;
          energy += value * value;
          meter.finite &&= Number.isFinite(pcm[i]);
          meter.maxAbs = Math.max(meter.maxAbs, Math.abs(pcm[i]));
          if (i && pcm[i - 1] <= mean && pcm[i] > mean) crossings.push(i - 1 + (mean - pcm[i - 1]) / (pcm[i] - pcm[i - 1]));
        }
        const rms = Math.sqrt(energy / pcm.length); meter.peak = Math.max(meter.peak, rms);
        meter.frequency[channel] = rms > 0.001 && crossings.length > 2
          ? meter.context.sampleRate * (crossings.length - 1) / (crossings.at(-1) - crossings[0]) : 0;
      });
    }
  }
  setInterval(sample, 20);
  window.__msxOutput = {
    reset() { for (const meter of meters) {meter.peak = meter.maxAbs = 0; meter.frequency = [0,0];} },
    read() {
      sample();
      return {states:contexts.map(context => context.state), nodes:[...nodes], meters:meters.map(({peak,maxAbs,finite,frequency}) => ({peak,maxAbs,finite,frequency}))};
    },
  };
}

async function until(page, predicate, label, timeout = 25000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw Error(`${label}; status=${await page.locator('#status').textContent()}; detail=${await page.locator('#detail').textContent()}`);
}
const status = (page, expected) => until(page, async () => (await page.locator('#status').textContent()).startsWith(expected), `Expected ${expected}`);
async function output(page, example, {closed = true, audible = true, pitch = false} = {}) {
  if (closed) await until(page, () => page.evaluate(() => window.__msxOutput.read().states.every(state => state === 'closed')), 'AudioContext leak');
  const result = await page.evaluate(() => window.__msxOutput.read());
  assert(result.meters.every(meter => meter.finite && meter.maxAbs <= 1.000001), `Invalid/clipped PCM ${JSON.stringify(result)}`);
  const allowed = new Set(example.composite ? ['tetorica-native-fx', ...example.chips.map(chip => `tetorica-${chip === 'y8950' ? 'opl' : chip}`)] : ['tetorica-soundchip']);
  assert(result.nodes.every(node => allowed.has(node.processor) && (node.processor !== 'tetorica-soundchip' || example.chips.includes(node.chip))), `Unexpected hidden chip: ${JSON.stringify(result.nodes)}`);
  const peak = Math.max(0, ...result.meters.map(meter => meter.peak));
  if (audible) assert(peak > 0.001, `No varying PCM ${JSON.stringify(result)}`);
  else assert(peak < 0.000001, `Cancelled source produced PCM ${JSON.stringify(result)}`);
  if (pitch) {
    const frequencies = result.meters.flatMap(meter => meter.frequency).filter(value => value > 0);
    assert(frequencies.length >= 2 && frequencies.every(value => Math.abs(value - 440) < 3), `A4 tuning: ${JSON.stringify(result)}`);
  }
  return {peak, nodes:result.nodes};
}
function editedSource(example, target, seconds = 30) {
  const stop = example.tune.map(name => `${name}.allNotesOff();`).join('\n');
  const muteOthers = example.composite ? example.tune.map(name => `await mixer.set(${name}.id, {muted:${name !== target},volume:0.8});`).join('\n') : '';
  const voice = target === 'ay'
    ? `ay.initialize(); ay.setVoice(0,{tone:true,noise:false,volume:12,envelope:false}); ay.noteOn(0,'A4');`
    : target === 'opll' ? `opll.initialize(); opll.setUserPatch(OPLL_USER_PRESETS.sine); opll.setVoice(0,{instrument:0,attenuation:4,sustain:false}); opll.noteOn(0,'A4');`
    : `opl.initialize(); opl.setPreset(0,OPL_PRESETS.sine); opl.noteOn(0,'A4');`;
  return `${stop}\n${muteOthers}\n${voice}\nconsole.log('EDITED_MSX_SOURCE'); await sleep(${seconds}); ${target}.allNotesOff(); await sleep(0.2);`;
}
async function checkExample(browser, base, example, execution) {
  const page = await browser.newPage({serviceWorkers:'block'}), errors = [], missing = [];
  page.setDefaultTimeout(25000); await page.addInitScript(installOutputAudit);
  page.on('pageerror', error => errors.push(error.stack ?? error.message));
  page.on('response', response => {if (response.status() === 404) missing.push(response.url());});
  let release;
  try {
    await page.goto(`${base}examples/${example.path}/web/index.html`); await status(page, 'Ready.');
    assert.deepEqual((await page.evaluate(() => window.__msxOutput.read())).states, [], 'Audio began on page load');
    if (example.composite) await page.selectOption('#execution', execution);
    const original = await page.locator('#code').inputValue();
    let requested;
    const started = new Promise(resolve => {requested = resolve;}), held = new Promise(resolve => {release = resolve;});
    await page.route(`**/generated/${example.chips[0]}_wasm.wasm*`, async route => {
      requested(); await held; try {await route.continue();} catch (error) {if (!/closed|cancel|abort|Target/i.test(String(error))) throw error;}
    });
    await page.locator('#code').fill(`console.log('CANCELLED_SOURCE_EXECUTED');\n${original}`);
    await page.click('#play');
    let timer;
    try {await Promise.race([started, new Promise((_, reject) => {timer = setTimeout(() => reject(Error('WASM not requested')), 20000);})]);}
    finally {clearTimeout(timer);}
    await page.click('#stop'); release(); await status(page, 'Stopped.');
    await output(page, example, {audible:false});
    assert.doesNotMatch(await page.locator('#detail').textContent(), /CANCELLED_SOURCE_EXECUTED/);

    await page.locator('#code').fill(original); await page.click('#play'); await status(page, 'Finished.');
    const originalOutput = await output(page, example);
    for (const target of example.tune) {
      await page.locator('#code').fill(editedSource(example, target));
      await page.evaluate(() => window.__msxOutput.reset()); await page.click('#play'); await status(page, 'Playing');
      await until(page, () => page.evaluate(() => window.__msxOutput.read().meters.some(meter => meter.peak > 0.001)), `Edited ${target} source silent`)
        .catch(async error => {throw Error(`${error.message}; output=${JSON.stringify(await page.evaluate(() => window.__msxOutput.read()))}`);});
      await new Promise(resolve => setTimeout(resolve, 300));
      await output(page, example, {closed:false,pitch:true});
      await page.click('#stop'); await status(page, 'Stopped.'); await output(page, example);
    }
    await page.locator('#code').fill(editedSource(example, example.tune[0], 0.5));
    await page.click('#play'); await status(page, 'Finished.'); await output(page, example);
    assert.match(await page.locator('#detail').textContent(), /EDITED_MSX_SOURCE/);
    assert(await page.locator('#play').isEnabled()); assert(await page.locator('#stop').isDisabled());
    if (example.composite) assert(await page.locator('#execution').isEnabled());
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    return {path:example.path, execution, originalOutput, editedA4:example.tune, cancelledInitialization:true, stoppedPlayback:true, rerun:true};
  } finally {release?.(); await page.close();}
}

try {
  const manifest = JSON.parse(await readFile(join(dist, 'examples/manifest.json'), 'utf8'));
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium,webkit};
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless:true,...(name === 'chromium' ? {args:['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      const catalog = await browser.newPage(); await catalog.goto(base);
      await until(catalog, async () => await catalog.locator('.sample-card').count() === manifest.length, 'Incomplete catalog');
      for (const example of Object.values(cases)) await catalog.locator(`a[href="./examples/${example.path}/web/index.html"]`).waitFor();
      await catalog.close();
      for (const [key, example] of Object.entries(cases)) {
        if (selected && selected !== key) continue;
        for (const execution of example.composite ? ['main','worker'] : ['worklet']) {
          console.log(JSON.stringify({browser:name,passed:true,subpath:true,...await checkExample(browser,base,example,execution)}));
        }
      }
    } finally {await browser.close();}
  }
} finally {if (server.listening) await new Promise(resolve => server.close(resolve));}

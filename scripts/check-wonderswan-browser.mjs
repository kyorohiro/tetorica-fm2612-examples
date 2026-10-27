// Build first. Uses the installed npm runtime from a repository subpath.
// Optional: --chromium, --webkit, --case=wave|noise|voice.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), prefix = '/examples-site/';
const cases = {
  wave: 'wonderswan/wave/01-four-channels',
  noise: 'wonderswan/noise/01-noise-sweep',
  voice: 'wonderswan/voice/01-timed-pcm',
};
const selected = process.argv.find(value => value.startsWith('--case='))?.slice(7);
if (selected) assert(Object.hasOwn(cases, selected), `Unknown case ${selected}`);
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') {response.writeHead(204).end(); return;}
    assert(pathname.startsWith(prefix));
    let file = resolve(dist, pathname.slice(prefix.length));
    const local = relative(dist, file);
    assert(local !== '..' && !local.startsWith('..' + sep));
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch (error) {response.writeHead(404).end(String(error));}
});

// Measure the actual final output, but mute physical output in automated checks.
function installOutputAudit() {
  const contexts = [], nodes = [], meters = [], commands = [];
  const NativeContext = window.AudioContext, NativeWorklet = window.AudioWorkletNode;
  window.AudioContext = new Proxy(NativeContext, {construct(Target, args) {
    const context = Reflect.construct(Target, args); contexts.push(context); return context;
  }});
  window.AudioWorkletNode = new Proxy(NativeWorklet, {construct(Target, args) {
    const node = Reflect.construct(Target, args);
    nodes.push({processor: args[1], chip: args[2]?.processorOptions?.name});
    const post = node.port.postMessage.bind(node.port);
    node.port.postMessage = (data, ...rest) => {
      if (data?.method) {
        const entries = data.method === 'schedule-writes' ? data.args[0] : null;
        commands.push({method: data.method, count: entries?.length,
          pcm: entries?.filter(entry => entry.register === 0x89).length});
      }
      return post(data, ...rest);
    };
    return node;
  }});
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(destination, ...args) {
    if (destination !== this.context.destination) return connect.call(this, destination, ...args);
    const splitter = this.context.createChannelSplitter(2), silent = this.context.createGain();
    silent.gain.value = 0;
    const analysers = [0, 1].map(channel => {
      const analyser = this.context.createAnalyser(); analyser.fftSize = 4096;
      connect.call(splitter, analyser, channel); connect.call(analyser, silent); return analyser;
    });
    connect.call(this, splitter); connect.call(silent, destination);
    meters.push({context: this.context, analysers, peak: [0, 0], maxAbs: 0, finite: true, frequency: [0, 0], pitchHits: [0, 0], leftOnly: 0, rightOnly: 0});
    return destination;
  };
  function sample() {
    for (const meter of meters) {
      if (meter.context.state !== 'running') continue;
      const levels = meter.analysers.map((analyser, channel) => {
        const pcm = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(pcm);
        const mean = pcm.reduce((sum, value) => sum + value, 0) / pcm.length;
        let energy = 0; const crossings = [];
        for (let i = 0; i < pcm.length; i++) {
          energy += (pcm[i] - mean) ** 2;
          meter.finite &&= Number.isFinite(pcm[i]);
          meter.maxAbs = Math.max(meter.maxAbs, Math.abs(pcm[i]));
          if (i && pcm[i - 1] <= mean && pcm[i] > mean) crossings.push(i - 1 + (mean - pcm[i - 1]) / (pcm[i] - pcm[i - 1]));
        }
        const rms = Math.sqrt(energy / pcm.length);
        meter.peak[channel] = Math.max(meter.peak[channel], rms);
        if (rms > 0.001 && crossings.length > 4) {
          meter.frequency[channel] = meter.context.sampleRate * (crossings.length - 1) / (crossings.at(-1) - crossings[0]);
          if (Math.abs(meter.frequency[channel] - 440) < 3) meter.pitchHits[channel]++;
        }
        return rms;
      });
      if (levels[0] > 0.001 && levels[1] < 0.00001) meter.leftOnly++;
      if (levels[1] > 0.001 && levels[0] < 0.00001) meter.rightOnly++;
    }
  }
  setInterval(sample, 20);
  window.__wsOutput = {
    reset() {for (const meter of meters) {meter.peak = [0, 0]; meter.maxAbs = 0; meter.frequency = [0, 0]; meter.pitchHits = [0, 0]; meter.leftOnly = meter.rightOnly = 0;} commands.length = 0;},
    read() {sample(); return {states: contexts.map(context => context.state), nodes, commands,
      meters: meters.map(({peak, maxAbs, finite, frequency, pitchHits, leftOnly, rightOnly}) => ({peak, maxAbs, finite, frequency, pitchHits, leftOnly, rightOnly}))};},
  };
}
async function until(page, predicate, label, timeout = 25000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw Error(`${label}; state=${await page.locator('body').innerText()}`);
}
const status = (page, expected) => until(page, async () => (await page.locator('#status').textContent()).startsWith(expected), `Expected ${expected}`);
async function output(page, {audible = true, pan = false, pitch = false, closed = true} = {}) {
  if (closed) await until(page, () => page.evaluate(() => window.__wsOutput.read().states.every(state => state === 'closed')), 'AudioContext leak');
  const result = await page.evaluate(() => window.__wsOutput.read());
  assert(result.nodes.every(node => node.processor === 'tetorica-soundchip' && node.chip === 'wonderswan'), `Unexpected hidden chip: ${JSON.stringify(result.nodes)}`);
  assert(result.meters.every(meter => meter.finite && meter.maxAbs <= 1.000001), `Non-finite/clipped PCM: ${JSON.stringify(result)}`);
  const peak = Math.max(0, ...result.meters.flatMap(meter => meter.peak));
  if (audible) assert(peak > 0.001, `Silent output: ${JSON.stringify(result)}`);
  else assert(peak < 0.000001, `Cancelled initialization played audio: ${JSON.stringify(result)}`);
  if (pan) assert(result.meters.some(meter => meter.leftOnly > 2 && meter.rightOnly > 2), `Pan failed: ${JSON.stringify(result)}`);
  if (pitch) assert(result.meters.some(meter => meter.pitchHits.every(count => count >= 3)), `A4 tuning failed: ${JSON.stringify(result)}`);
  return {peak, nodes: result.nodes, meters: result.meters, commands: result.commands, physicalOutput: 'muted'};
}
const panSource = `const {ws, transport} = await startAudio();
ws.initialize();
ws.setWaveform(0, Array.from({length:32}, (_,i) => Math.round(7.5 + 7.5 * Math.sin(i * Math.PI / 16))));
ws.setPan(0, 9, 0); ws.noteOn(0, 'A4'); await transport.start();
console.log('EDITED_WONDERSWAN_SOURCE'); await sleep(0.7);
ws.setPan(0, 0, 9); await sleep(0.7); ws.allNotesOff(); await sleep(0.1);`;
async function checkExample(browser, base, key, path) {
  const page = await browser.newPage({serviceWorkers: 'block'}), errors = [], missing = [];
  page.setDefaultTimeout(25000); await page.addInitScript(installOutputAudit);
  page.on('pageerror', error => errors.push(error.stack ?? error.message));
  page.on('response', response => {if (response.status() === 404) missing.push(response.url());});
  let release;
  try {
    await page.goto(`${base}examples/${path}/web/index.html`); await status(page, 'Ready.');
    assert.deepEqual((await page.evaluate(() => window.__wsOutput.read())).states, [], 'Audio began on page load');
    const original = await page.locator('#code').inputValue();
    let requested;
    const started = new Promise(resolve => {requested = resolve;}), held = new Promise(resolve => {release = resolve;});
    await page.route('**/generated/wonderswan_wasm.wasm*', async route => {
      requested(); await held; try {await route.continue();} catch (error) {if (!/closed|cancel|abort|Target/i.test(String(error))) throw error;}
    });
    await page.locator('#code').fill(`console.log('CANCELLED_SOURCE_STARTED');\n${original}`);
    await page.click('#play');
    let timer;
    try {await Promise.race([started, new Promise((_, reject) => {timer = setTimeout(() => reject(Error('WASM not requested')), 20000);})]);}
    finally {clearTimeout(timer);}
    await page.click('#stop'); release(); await status(page, 'Stopped.');
    await output(page, {audible: false});
    await page.unroute('**/generated/wonderswan_wasm.wasm*');

    await page.locator('#code').fill(original); await page.click('#play'); await status(page, 'Finished.');
    const originalOutput = await output(page);
    if (key === 'voice') {
      const commands = originalOutput.commands;
      const scheduleIndex = commands.findIndex(command => command.method === 'schedule-writes');
      assert(scheduleIndex >= 0 && scheduleIndex < commands.findIndex(command => command.method === 'start'), 'Voice data must be queued before start');
      assert.equal(commands[scheduleIndex].count, 12002); assert.equal(commands[scheduleIndex].pcm, 12000);
    }
    await page.evaluate(() => window.__wsOutput.reset());
    await page.locator('#code').fill(panSource); await page.click('#play'); await status(page, 'Finished.');
    const editedOutput = await output(page, {pan: true, pitch: true});
    assert.match(await page.locator('#detail').textContent(), /EDITED_WONDERSWAN_SOURCE/);

    await page.evaluate(() => window.__wsOutput.reset());
    await page.locator('#code').fill(key === 'voice' ? original : panSource.replace('await sleep(0.7)', 'await sleep(30)'));
    await page.click('#play'); await status(page, 'Playing');
    await until(page, () => page.evaluate(() => window.__wsOutput.read().meters.some(meter => meter.peak.some(level => level > 0.001))), 'Stopped run never produced audio');
    await page.click('#stop'); await status(page, 'Stopped.');
    const stoppedOutput = await output(page);
    assert(stoppedOutput.commands.some(command => command.method === 'clear-scheduled-writes'), 'Stop did not clear pending writes');
    assert(await page.locator('#play').isEnabled()); assert(await page.locator('#stop').isDisabled());
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    const compact = ({commands, ...rest}) => ({...rest,
      commandCounts: Object.fromEntries([...new Set(commands.map(command => command.method))].map(method => [method, commands.filter(command => command.method === method).length])),
      scheduled: commands.filter(command => command.method === 'schedule-writes')});
    return {path, originalOutput: compact(originalOutput), editedOutput: compact(editedOutput), cancelledInitialization: true, stoppedPlayback: true, rerun: true};
  } finally {release?.(); await page.close();}
}

try {
  const manifest = JSON.parse(await readFile(join(dist, 'examples/manifest.json'), 'utf8'));
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium, webkit};
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless: true, ...(name === 'chromium' ? {args: ['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      const catalog = await browser.newPage(); await catalog.goto(base);
      await until(catalog, async () => await catalog.locator('.sample-card').count() === manifest.length, 'Incomplete catalog');
      for (const path of Object.values(cases)) await catalog.locator(`a[href="./examples/${path}/web/index.html"]`).waitFor();
      await catalog.close();
      for (const [key, path] of Object.entries(cases)) {
        if (selected && selected !== key) continue;
        console.log(JSON.stringify({browser: name, version: browser.version(), passed: true, subpath: true, ...await checkExample(browser, base, key, path)}));
      }
    } finally {await browser.close();}
  }
} finally {if (server.listening) await new Promise(resolve => server.close(resolve));}

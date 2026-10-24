// Build first. Exercise the installed npm preset through real browser Worklets.
// Optional: --chromium, --webkit, --root=/path/to/built/site.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(process.argv.find(argument => argument.startsWith('--root='))?.slice(7) ?? join(root, 'dist'));
const prefix = '/examples-site/';
const examplePath = 'embedding/12-calibrated-mixer';
const names = ['ym2612', 'segapsg', 'ay8910', 'nes'];
// Independent expectations from the published 0.2.27 measurement policy.
const calibrated = {ym2612:0.775938, segapsg:0.455420, ay8910:1.100331, nes:1.514209};
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
    const bytes = await readFile(file);
    // Expose the demo's live public objects only in this test server. This does
    // not replace the factory, alter its audio graph or ship a production hook.
    response.end(file === join(dist,'examples',examplePath,'web/main.js')
      ? `${bytes.toString('utf8')}\n;globalThis.__calibratedMixerRun = () => currentRun;\n` : bytes);
  } catch (error) {response.writeHead(404).end(String(error));}
});

/** Observe actual PCM before and after the Mixer. Only the test sink is muted. */
function installOutputAudit() {
  const contexts = [], worklets = [], outputs = [], failures = [];
  const nativeConnect = AudioNode.prototype.connect;
  const NativeContext = window.AudioContext, NativeWorklet = window.AudioWorkletNode;
  const destinations = new WeakMap();
  function meter(source, label) {
    const analyser = source.context.createAnalyser();
    analyser.fftSize = 8192;
    const silent = source.context.createGain(); silent.gain.value = 0;
    nativeConnect.call(source, analyser); nativeConnect.call(analyser, silent);
    nativeConnect.call(silent, source.context.destination);
    return {label, context:source.context, analyser, maxAbs:0, maxRms:0, finite:true};
  }
  window.AudioContext = new Proxy(NativeContext, {construct(Target, args) {
    const context = Reflect.construct(Target, args); contexts.push(context); return context;
  }});
  if (window.webkitAudioContext === NativeContext) window.webkitAudioContext = window.AudioContext;
  window.AudioWorkletNode = new Proxy(NativeWorklet, {construct(Target, args) {
    const node = Reflect.construct(Target, args);
    const record = {processor:args[1], name:args[2]?.processorOptions?.name};
    if (record.processor === 'tetorica-soundchip') record.meter = meter(node, record.name);
    worklets.push(record); return node;
  }});
  AudioNode.prototype.connect = function(destination, ...args) {
    if (destination !== this.context.destination) return nativeConnect.call(this, destination, ...args);
    // Preserve the complete example graph up to its destination. Silence the
    // physical speakers only, after measuring the example's final master output.
    let output = destinations.get(this);
    if (!output) {
      output = meter(this, 'master'); destinations.set(this, output); outputs.push(output);
      const silent = this.context.createGain(); silent.gain.value = 0; output.sink = silent;
      nativeConnect.call(silent, destination);
    }
    nativeConnect.call(this, output.sink, ...args);
    return destination;
  };
  function sample(record) {
    if (record.context.state !== 'running') return {rms:0, acRms:0, maxAbs:0};
    const pcm = new Float32Array(record.analyser.fftSize); record.analyser.getFloatTimeDomainData(pcm);
    let sum = 0, squared = 0, maxAbs = 0;
    for (const value of pcm) {
      record.finite &&= Number.isFinite(value); sum += value; squared += value * value;
      maxAbs = Math.max(maxAbs, Math.abs(value));
    }
    const mean = sum / pcm.length, rms = Math.sqrt(squared / pcm.length);
    const acRms = Math.sqrt(Math.max(0, squared / pcm.length - mean * mean));
    record.maxAbs = Math.max(record.maxAbs, maxAbs); record.maxRms = Math.max(record.maxRms, acRms);
    if (!record.finite && !failures.includes('Non-finite PCM')) failures.push('Non-finite PCM');
    return {rms, acRms, maxAbs};
  }
  function snapshot(record) {
    return {...sample(record), maxRms:record.maxRms, peak:record.maxAbs, finite:record.finite};
  }
  setInterval(() => {for (const record of [...outputs, ...worklets.flatMap(node => node.meter ? [node.meter] : [])]) sample(record);}, 20);
  window.__mixerOutput = {
    read() {
      return {states:contexts.map(context => context.state), failures:[...failures],
        outputs:outputs.map(record => snapshot(record)),
        worklets:worklets.map(({processor,name,meter}) => ({processor,name,...(meter ? snapshot(meter) : {})}))};
    },
  };
}

async function until(page, predicate, label, timeout = 25000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  const detail = await page.locator('#detail').count() ? await page.locator('#detail').textContent() : '';
  throw Error(`${label}; status=${await page.locator('#status').textContent()}; detail=${detail}`);
}
const status = (page, expected) => until(page, async () => (await page.locator('#status').textContent()).startsWith(expected), `Expected ${expected}`);
const audit = page => page.evaluate(() => window.__mixerOutput.read());

async function checkClosed(page) {
  await until(page, async () => (await audit(page)).states.every(state => state === 'closed'), 'AudioContext leak');
  const result = await audit(page);
  assert.deepEqual(result.failures, []);
  assert(result.worklets.every(node => node.processor === 'tetorica-soundchip' && names.includes(node.name)), `Unexpected Worklet ${JSON.stringify(result.worklets)}`);
  assert(result.outputs.every(output => output.finite && output.peak < 1), `Invalid/clipped PCM ${JSON.stringify(result)}`);
  return result;
}

async function checkPolicy(page, base) {
  return page.evaluate(async ({base,calibrated}) => {
    const {SoundChipMixer,SOUNDCHIP_MIXER_PRESETS} = await import(`${base}vendor/tetorica-fm2612/soundchip.js`);
    const preset = SOUNDCHIP_MIXER_PRESETS.calibrated;
    const mixer = new SoundChipMixer(preset), legacy = new SoundChipMixer();
    const rows = Object.entries(calibrated).map(([name]) => ({name, calibrated:mixer.getKindDefault(name).volume, legacy:legacy.getKindDefault(name).volume}));
    const original = mixer.getKindDefault('segapsg').volume;
    mixer.setKindDefault('segapsg',{volume:.7});
    mixer.register('override','segapsg',() => {});
    mixer.set('override',{volume:.5});
    return {rows, original, common:mixer.getKindDefault('segapsg').volume, absolute:mixer.get('override').volume,
      isolated:new SoundChipMixer(preset).getKindDefault('segapsg').volume,
      frozen:Object.isFrozen(SOUNDCHIP_MIXER_PRESETS) && Object.isFrozen(preset.factoryDefaults.kinds),
      rawDefault:legacy.getKindDefault('unmeasured').volume};
  }, {base,calibrated});
}

async function checkControls(page, running) {
  assert.equal(await page.locator('#play').isDisabled(),running);
  assert.equal(await page.locator('#stop').isEnabled(),running);
  assert.equal(await page.locator('#balance').isDisabled(),running);
}

async function checkCancelledLoad(page) {
  let release, requested;
  const held = new Promise(resolve => {release = resolve;});
  const started = new Promise(resolve => {requested = resolve;});
  const pattern = '**/generated/ym2612_wasm.wasm*';
  const handler = async route => {
    requested(); await held;
    try {await route.continue();} catch (error) {if (!/closed|cancel|abort|Target/i.test(String(error))) throw error;}
  };
  await page.route(pattern,handler);
  try {
    await page.click('#play');
    let timer;
    try {await Promise.race([started,new Promise((_,reject) => {timer = setTimeout(() => reject(Error('WASM was not requested')),20000);})]);}
    finally {clearTimeout(timer);}
    await checkControls(page,true);
    await page.click('#stop'); release(); await status(page,'Stopped.');
    await until(page,() => page.evaluate(() => !window.__calibratedMixerRun()),'Cancelled run retained');
    const result = await checkClosed(page);
    assert(result.outputs.every(output => output.maxRms < .000001), 'Cancelled initialization produced PCM');
    assert.equal(result.worklets.length,0,'Cancelled first chip must not start a later chip');
    await checkControls(page,false);
    return {contexts:result.states.length,worklets:result.worklets.length};
  } finally {release(); await page.unroute(pattern,handler);}
}

async function pcmRatio(page,chip,gain) {
  // Wait past the attack, previous note's gap and the analyser window. The
  // assertion compares independently observed raw and final varying PCM, so a
  // displayed policy value alone cannot satisfy it.
  await new Promise(resolve => setTimeout(resolve,220));
  const samples = [];
  for (let index = 0; index < 3; index++) {
    const result = await audit(page);
    const raw = result.worklets.findLast(node => node.name === chip);
    const output = result.outputs.at(-1);
    assert(raw && raw.acRms > .001, `No raw ${chip} PCM: ${JSON.stringify(result)}`);
    assert(output && output.acRms > .0001, `No final ${chip} PCM: ${JSON.stringify(result)}`);
    samples.push(output.acRms/raw.acRms);
    await new Promise(resolve => setTimeout(resolve,20));
  }
  const ratio = samples.sort((a,b) => a-b)[1], expected = .3*gain;
  assert(Math.abs(ratio-expected) < Math.max(.001,expected*.025), `${chip} physical gain ${ratio}, expected ${expected}`);
  return {chip,gain,ratio,expected};
}

async function checkSequence(page,mode,{override = false} = {}) {
  const before = await audit(page);
  await page.selectOption('#balance',mode); await page.click('#play');
  await until(page,() => page.evaluate(() => window.__calibratedMixerRun()?.activeChip === 'ym2612'),'Expected first note');
  await checkControls(page,true);
  const mixerRows = await page.evaluate(() => window.__calibratedMixerRun().mixer.list().map(({name,volume,connected}) => ({name,volume,connected})));
  assert.deepEqual(mixerRows.map(row => row.name).sort(),[...names].sort());
  for (const row of mixerRows) {assert.equal(row.connected,true); assert.equal(row.volume,mode === 'calibrated' ? calibrated[row.name] : 1);}
  for (const chip of names) {
    const cell = page.locator(`[data-chip="${chip}"] [data-volume]`);
    const value = Number(await cell.getAttribute('data-gain'));
    assert.equal(value,mode === 'calibrated' ? calibrated[chip] : 1,`Incorrect visible ${chip} default`);
    assert.equal(Number(await cell.textContent()),value,`Incorrect displayed ${chip} linear gain`);
  }
  const observed = [];
  for (const chip of names) {
    await until(page,async () => await page.locator(`[data-chip="${chip}"][data-state="playing"]`).count() === 1,`Expected active ${chip}`);
    observed.push(await pcmRatio(page,chip,mode === 'calibrated' ? calibrated[chip] : 1));
    if (override && chip === 'segapsg') {
      const value = await page.evaluate(() => {
        const run = window.__calibratedMixerRun(), chip = run.chips.find(chip => chip.name === 'segapsg');
        run.mixer.set(chip.id,{volume:.5}); return run.mixer.get(chip.id).volume;
      });
      assert.equal(value,.5,'Explicit Mixer volume is absolute');
      observed.push({...await pcmRatio(page,chip,.5),absoluteOverride:true});
    }
  }
  await status(page,'Finished.');
  await until(page,() => page.evaluate(() => !window.__calibratedMixerRun()),'Finished run retained');
  const result = await checkClosed(page);
  assert.equal(result.states.length,before.states.length+1,'Each Play owns exactly one new AudioContext');
  assert.equal(result.worklets.length,before.worklets.length+4,'Each run creates exactly the requested four Worklets');
  assert.deepEqual(result.worklets.slice(-4).map(node => node.name),names);
  assert.equal(await page.locator('#balance').inputValue(),mode,'Selection changed during cleanup');
  await checkControls(page,false);
  return observed;
}

async function checkStoppedPlayback(page) {
  await page.selectOption('#balance','calibrated'); await page.click('#play');
  await until(page,() => page.evaluate(() => window.__calibratedMixerRun()?.activeChip === 'ym2612'),'Expected rerun first note');
  await until(page,async () => (await audit(page)).outputs.at(-1)?.acRms > .001,'Rerun is silent');
  await page.click('#stop'); await status(page,'Stopped.');
  await until(page,() => page.evaluate(() => !window.__calibratedMixerRun()),'Stopped run retained');
  await checkClosed(page); await checkControls(page,false);
}

try {
  await stat(join(dist, 'examples', examplePath, 'web/index.html'));
  const packageInfo = JSON.parse(await readFile(join(dist,'vendor/tetorica-fm2612/package.json'),'utf8'));
  assert.equal(packageInfo.version, '0.2.27', 'Build against the declared published calibrated-preset package');
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium,webkit};
  for (const [name,engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless:true,...(name === 'chromium' ? {args:['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      const page = await browser.newPage({serviceWorkers:'block'}), errors = [], missing = [];
      page.setDefaultTimeout(25000);
      page.on('pageerror', error => errors.push(error.stack ?? error.message));
      page.on('response', response => {if (response.status() === 404) missing.push(response.url());});
      await page.addInitScript(installOutputAudit);
      try {
        await page.goto(`${base}examples/${examplePath}/web/index.html`); await status(page,'Ready.');
        assert.deepEqual((await audit(page)).states, [], 'Opening the page started audio');
        const policy = await checkPolicy(page,base);
        for (const row of policy.rows) {assert.equal(row.calibrated,calibrated[row.name]); assert.equal(row.legacy,1);}
        assert.equal(policy.common,.7); assert.equal(policy.absolute,.5); assert.equal(policy.isolated,calibrated.segapsg);
        assert.equal(policy.rawDefault,1); assert.equal(policy.frozen,true);
        assert.equal(await page.locator('#balance').inputValue(),'calibrated');
        const screenshots = {};
        for (const [layout,viewport] of Object.entries({wide:{width:1365,height:900},narrow:{width:390,height:844}})) {
          await page.setViewportSize(viewport);
          screenshots[layout] = `/private/tmp/tetorica-calibrated-mixer-${name}-${layout}.png`;
          await page.screenshot({path:screenshots[layout],fullPage:true});
        }
        await page.setViewportSize({width:1365,height:900});
        const cancelled = await checkCancelledLoad(page);
        const measured = {calibrated:await checkSequence(page,'calibrated',{override:true}),legacy:await checkSequence(page,'legacy')};
        await checkStoppedPlayback(page);
        console.log(JSON.stringify({browser:name,passed:true,subpath:true,version:packageInfo.version,policy,measured,cancelled,stoppedPlayback:true,repeatedPlayCleanup:true,screenshots}));
        assert.deepEqual(errors, []); assert.deepEqual(missing, []);
      } finally {await page.close();}
    } finally {await browser.close();}
  }
} finally {if (server.listening) await new Promise(resolve => server.close(resolve));}

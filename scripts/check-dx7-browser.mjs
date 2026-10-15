// Real npm runtime, DX7 WASM, Worker/Main execution, and final Web Audio output.
// Run `npm run build` first. No development server or external assets are needed.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const notesPath = '/examples/dx7/01-notes/web/index.html';
const sysexPath = '/examples/dx7/02-sysex/web/index.html';
for (const path of [notesPath, sysexPath]) await stat(join(dist, path));
const bank = await readFile(join(dist, 'examples/dx7/02-sysex/assets/original-bank.syx'));
assert.equal(bank.length, 4104, 'The bundled self-authored bank must contain 32 voices');
const invalidBank = Buffer.from(bank);
invalidBank[invalidBank.length - 2] = (invalidBank[invalidBank.length - 2] + 1) & 0x7f;

const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = resolve(dist, '.' + pathname);
    const local = relative(dist, file);
    if (local.startsWith('..' + sep) || local === '..') throw Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch (error) {
    response.writeHead(404).end(String(error));
  }
});

// Observe nodes connected to the actual output destination. A zero-gain branch
// keeps the analyser pulled without changing the example's audible signal.
function installAudioMeter() {
  const connect = AudioNode.prototype.connect;
  const observed = new WeakSet();
  const meters = [];
  const failures = [];
  AudioNode.prototype.connect = function(destination, ...args) {
    const result = connect.call(this, destination, ...args);
    if (destination === this.context.destination && !observed.has(this)) {
      observed.add(this);
      try {
        const analyser = this.context.createAnalyser();
        analyser.fftSize = 2048;
        const silent = this.context.createGain();
        silent.gain.value = 0;
        connect.call(this, analyser);
        connect.call(analyser, silent);
        connect.call(silent, this.context.destination);
        meters.push({context:this.context, analyser, pcm:new Float32Array(analyser.fftSize), peak:0});
      } catch (error) { failures.push(error.message); }
    }
    return result;
  };
  function sample() {
    for (const meter of meters) {
      if (meter.context.state !== 'running') continue;
      meter.analyser.getFloatTimeDomainData(meter.pcm);
      let energy = 0;
      for (const value of meter.pcm) {
        if (!Number.isFinite(value)) { failures.push('Non-finite final output PCM'); break; }
        energy += value * value;
      }
      meter.peak = Math.max(meter.peak, Math.sqrt(energy / meter.pcm.length));
    }
  }
  setInterval(sample, 20);
  window.__dx7Output = {
    reset() { for (const meter of meters) meter.peak = 0; },
    read() {
      sample();
      return {peak:Math.max(0, ...meters.map(meter => meter.peak)), states:meters.map(meter => meter.context.state), failures:[...failures]};
    },
  };
}

async function withTimeout(promise, message, milliseconds = 20000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(message)), milliseconds); })]);
  } finally { clearTimeout(timer); }
}

async function openPage(browser, base, path) {
  const page = await browser.newPage({serviceWorkers:'block'});
  const errors = [], missing = [];
  page.on('pageerror', error => errors.push(error.stack || error.message));
  page.on('response', response => { if (response.status() === 404) missing.push(response.url()); });
  await page.addInitScript(installAudioMeter);
  return {
    page,
    async goto() {
      await page.goto(base + path);
      await page.waitForFunction(() => document.getElementById('status')?.textContent === 'Ready.');
      assert.equal(await page.locator('#execution').inputValue(), 'worker', 'Worker should be the initial execution mode');
    },
    assertClean() {
      assert.deepEqual(errors, [], 'Unexpected page errors');
      assert.deepEqual(missing, [], 'Missing built-site assets');
    },
  };
}

async function waitStatus(page, expected) {
  try {
    await page.waitForFunction(expected => document.getElementById('status').textContent === expected, expected, {timeout:30000});
  } catch (error) {
    throw Error(`Expected ${JSON.stringify(expected)}; actual status ${JSON.stringify(await page.locator('#status').textContent())}`, {cause:error});
  }
}

async function assertOutput(page, audible) {
  const output = await page.evaluate(() => window.__dx7Output.read());
  assert.deepEqual(output.failures, [], 'Output observation failed');
  if (audible) assert(output.peak > 0.001, `DX7 final output was silent (RMS ${output.peak})`);
  else assert(output.peak < 0.000001, `Cancelled initialization produced audio (RMS ${output.peak})`);
  assert(output.states.length > 0, 'No actual Web Audio destination connection was observed');
  assert(output.states.every(state => state === 'closed'), `Audio contexts remain open: ${output.states}`);
  return output.peak;
}

async function delayDx7Wasm(page) {
  let release, requested;
  const held = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { requested = resolve; });
  await page.route('**/msfa_dx7/wasm/msfa.wasm', async route => {
    requested();
    await held;
    await route.continue();
  });
  return {release, wait:() => withTimeout(started, 'DX7 WASM initialization was not requested')};
}

async function checkNotes(browser, base, execution) {
  const audit = await openPage(browser, base, notesPath), {page} = audit;
  const gate = await delayDx7Wasm(page);
  try {
    await audit.goto();
    await page.selectOption('#execution', execution);
    const original = await page.locator('#code').inputValue();
    const editable = "const dx7 = await useSoundChip('dx7');\ndx7.noteOn(67, 100);\nconsole.log('EDITED_DX7_SOURCE');\nawait sleep(0.4);\ndx7.allNotesOff();\nawait sleep(0.2);";
    await page.locator('#code').fill(editable);
    await page.click('#play');
    await gate.wait();
    assert.equal(await page.locator('#play').isDisabled(), true);
    await page.click('#stop');
    gate.release();
    await waitStatus(page, 'Stopped.');
    assert.equal((await page.locator('#detail').textContent()).includes('EDITED_DX7_SOURCE'), false, 'Cancelled initialization ran the score');
    await assertOutput(page, false);

    await page.locator('#code').fill(original);
    await page.evaluate(() => window.__dx7Output.reset());
    await page.click('#play');
    await waitStatus(page, 'Finished.');
    const defaultRms = await assertOutput(page, true);
    assert.equal(await page.locator('#play').isEnabled(), true);
    assert.equal(await page.locator('#stop').isDisabled(), true);
    assert.equal(await page.locator('#execution').isEnabled(), true);

    await page.locator('#code').fill(editable);
    await page.evaluate(() => window.__dx7Output.reset());
    await page.click('#play');
    await waitStatus(page, 'Finished.');
    assert((await page.locator('#detail').textContent()).includes('EDITED_DX7_SOURCE'), 'Play did not execute the edited code');
    const editedRms = await assertOutput(page, true);
    audit.assertClean();
    return {execution, stoppedInitialization:true, defaultRms, editedRms};
  } finally { gate.release(); await page.close(); }
}

async function checkSysex(browser, base, execution) {
  const audit = await openPage(browser, base, sysexPath), {page} = audit;
  const gate = await delayDx7Wasm(page);
  try {
    await audit.goto();
    await page.selectOption('#execution', execution);
    assert.equal(await page.locator('#play').isDisabled(), true, 'Play requires a successfully loaded bank');
    await page.click('#load');
    await gate.wait();
    await page.click('#stop');
    gate.release();
    await waitStatus(page, 'Stopped.');
    assert.equal(await page.locator('#play').isDisabled(), true, 'Cancelled loading published a bank');
    await assertOutput(page, false);

    await page.click('#load');
    await waitStatus(page, 'Loaded 32 voice(s). Choose a voice and press Play.');
    const voices = await page.locator('#voice option').allTextContents();
    assert.equal(voices.length, 32);
    assert(voices.every((name, index) => name.startsWith(index + ' — ')), 'Voice indexes/names were not populated from the loaded bank');
    await page.selectOption('#voice', '7');
    await page.evaluate(() => window.__dx7Output.reset());
    await page.click('#play');
    await waitStatus(page, 'Finished.');
    assert((await page.locator('#detail').textContent()).includes('Selected: 7 — '), 'The selected voice was not auditioned');
    const rms = await assertOutput(page, true);

    // Preserve the valid-size format but corrupt its checksum: exercise DX7
    // validation rather than only the host's file-length check.
    await page.locator('#file').setInputFiles({name:'invalid-checksum.syx', mimeType:'application/octet-stream', buffer:invalidBank});
    await page.click('#load');
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Error:') && !document.getElementById('load').disabled);
    assert((await page.locator('#status').textContent()).includes('previous bank is still available'), 'Invalid input did not report preservation of the valid bank');
    assert.deepEqual(await page.locator('#voice option').allTextContents(), voices, 'Invalid input replaced the previously loaded bank');
    assert.equal(await page.locator('#voice').inputValue(), '7');
    assert.equal(await page.locator('#play').isEnabled(), true);
    await page.evaluate(() => window.__dx7Output.reset());
    await page.click('#play');
    await waitStatus(page, 'Finished.');
    const recoveredRms = await assertOutput(page, true);
    audit.assertClean();
    return {execution, voices:voices.length, stoppedInitialization:true, invalidBankPreserved:true, rms, recoveredRms};
  } finally { gate.release(); await page.close(); }
}

const engines = process.argv.includes('--chromium') ? {chromium} : process.argv.includes('--webkit') ? {webkit} : {chromium, webkit};
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch({headless:true, ...(name === 'chromium' ? {args:['--autoplay-policy=no-user-gesture-required']} : {})});
    try {
      for (const execution of ['main', 'worker']) {
        const notes = await checkNotes(browser, base, execution);
        const sysex = await checkSysex(browser, base, execution);
        console.log(JSON.stringify({browser:name, passed:true, notes, sysex}));
      }
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.close(resolve)); }

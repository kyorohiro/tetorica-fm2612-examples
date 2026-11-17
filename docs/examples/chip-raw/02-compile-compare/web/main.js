// SPDX-License-Identifier: BSD-3-Clause
// Published npm only. Inspect creates one permanently muted comparison chip.
import {createOpnAudio} from 'tetorica-fm2612/playground_opn_audio.js';
import {createOpnClient} from 'tetorica-fm2612/playground_opn.js';

const inspectButton = document.getElementById('inspect');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const results = document.getElementById('results');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

editor.value = `fm.setOperator(0, 0, {dt:3, multi:1}); // Client and renderer: R30 = 0x31.

// Schedule a renderer-only edit. The JavaScript shadow intentionally keeps DT3.
const seed = fm.build(b => b.setOperator(0, 0, {dt:5}));
const accepted = await fm.schedule(seed, {name:"renderer-baseline"});
await waitForRegister(accepted.startFrame, 0, 0x30, 0x51); // Observe the seed write.

const operations = fm.build(b => {
  b.atSample(0).setOperator(0, 0, {multi:2}); // Edit this value, leaving DT alone.
  b.atSeconds(0.1).keyOn(0);
  b.keyOn(0); // Repeating the same trigger still produces a write.
  b.atSample(8820).keyOff(0); // 0.2 seconds at the default 44100 Hz reference.
});
const current = await fm.compile(operations); // Asynchronous renderer capture.
const client = await fm.compile(operations, {initialState:"client"}); // No capture.
const reset = await fm.compile(operations, {initialState:"reset"});
const snapshot = await fm.captureState();
const saved = JSON.stringify(snapshot);
const snapshotA = await fm.compile(operations, {initialState:snapshot});

fm.setOperator(0, 0, {dt:7, multi:9}); // Changing the live chip cannot alter snapshot.
const before = await fm.captureState();
const again = await fm.compile(operations, {initialState:snapshot});
const snapshotB = await fm.compile(fm.build(b => b.setOperator(0, 0, {dt:1})), {initialState:snapshot});
const after = await fm.captureState();
return {
  baselines:{current, client, reset, snapshotA, snapshotB},
  snapshot:{frame:snapshot.frame, sampleRate:snapshot.sampleRate, engine:snapshot.engine},
  checks:{
    currentMatchesSnapshot:JSON.stringify(current) === JSON.stringify(snapshotA),
    snapshotReusable:JSON.stringify(snapshotA) === JSON.stringify(again),
    snapshotUnchanged:JSON.stringify(snapshot) === saved && Object.isFrozen(snapshot) && snapshot.registers.every(Object.isFrozen),
    liveStateUnchanged:["registers", "frequencyLatches", "pitches", "specialPitches", "keyMasks"]
      .every(key => JSON.stringify(before[key]) === JSON.stringify(after[key])),
    repeatedKeysKept:snapshotA.filter(row => row.register === 0x28 && row.value === 0xf0).length === 2,
  },
};`;

function ensure(run) {run.controller.signal.throwIfAborted();}
function log(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 1500));
  detail.textContent = run.messages.slice(-12).join('\n');
}
function showTables(value) {
  if (!value || !value.baselines || typeof value.baselines !== 'object') throw Error('Return an object with baselines to display.');
  const labels = {current:'current — 実レンダラーの状態', client:'client — ローカル状態', reset:'reset — 初期レジスタ',
    snapshotA:'snapshot A — 取得済み状態からMULT変更', snapshotB:'snapshot B — 同じ取得状態からDT変更'};
  results.replaceChildren(); results.dataset.result = JSON.stringify(value);
  for (const [name, rows] of Object.entries(value.baselines)) {
    if (!Array.isArray(rows)) throw Error(`Invalid write table: ${name}`);
    const scroll = document.createElement('div'); scroll.className = 'table-scroll';
    const table = document.createElement('table'); table.dataset.baseline = name;
    const caption = document.createElement('caption'); caption.textContent = labels[name] ?? name; table.append(caption);
    const head = document.createElement('thead'), heading = document.createElement('tr');
    for (const title of ['秒', 'Port', 'Register', 'Value', '操作 / write']) {const th = document.createElement('th'); th.textContent = title; heading.append(th);}
    head.append(heading); table.append(head);
    const body = document.createElement('tbody');
    for (const row of rows) {
      const tr = document.createElement('tr');
      for (const text of [row.offsetSeconds, row.port, hex(row.register), hex(row.value), `${row.operationIndex} / ${row.writeIndex}`]) {
        const td = document.createElement('td'); td.textContent = String(text); tr.append(td);
      }
      body.append(tr);
    }
    table.append(body); scroll.append(table); results.append(scroll);
  }
}
function hex(value) {return Number.isInteger(value) ? '0x' + value.toString(16).toUpperCase().padStart(2, '0') : String(value);}

// A reported clock alone is not proof that a queued edit is visible. Observe
// both the boundary and the register value using the public captured state.
// This polling never schedules chip writes: the seed runs on the Worklet clock.
async function waitForRegister(run, frame, port, register, value) {
  const deadline = performance.now() + 5000;
  while (performance.now() < deadline) {
    ensure(run); const snapshot = await run.client.captureState(); ensure(run);
    if (snapshot.frame > frame && snapshot.registers[port][register] === value) return snapshot;
    await new Promise((resolve, reject) => {
      const signal = run.controller.signal;
      const timer = setTimeout(() => {signal.removeEventListener('abort', abort); resolve();}, 10);
      function abort() {clearTimeout(timer); reject(signal.reason);}
      signal.addEventListener('abort', abort, {once:true});
    });
  }
  throw Error('Renderer did not expose the accepted register write.');
}
async function close(run) {
  run.client?.dispose(); run.device?.dispose();
  if (run.context && !run.closing && run.context.state !== 'closed') run.closing = run.context.close();
  await run.closing;
}
function cancellable(promise, run) {
  const signal = run.controller.signal; signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => {signal.removeEventListener('abort', abort); reject(signal.reason);};
    signal.addEventListener('abort', abort, {once:true});
    Promise.resolve(promise).then(value => {
      signal.removeEventListener('abort', abort);
      signal.aborted ? reject(signal.reason) : resolve(value);
    }, error => {signal.removeEventListener('abort', abort); reject(error);});
  });
}

inspectButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller:new AbortController(), context:null, device:null, client:null, closing:null, messages:[]};
  activeRun = run; inspectButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Inspecting…'; detail.textContent = ''; results.replaceChildren(); delete results.dataset.result;
  let outcome = 'Compared.';
  try {
    const execute = new AsyncFunction('fm', 'waitForRegister', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    const mute = run.context.createGain(); mute.gain.value = 0; mute.connect(run.context.destination);
    await cancellable(run.context.resume(), run); ensure(run);
    const creating = createOpnAudio(run.context, mute, 'ym2612', {engine:'ymfm'});
    // Stop also wins if fetching / Worklet initialization is still pending.
    creating.then(device => {if (run.controller.signal.aborted) device.dispose();}, () => {});
    run.device = await cancellable(creating, run); ensure(run);
    run.client = createOpnClient('ym2612', run.device.port, {engine:'ymfm'});
    const output = Object.fromEntries(['log','warn','error','table'].map(method => [method, (...values) => {console[method](...values); log(run, values);} ]));
    const value = await execute(run.client, (frame, port, register, value) => waitForRegister(run, frame, port, register, value), output); ensure(run);
    showTables(value);
    if (value.checks && Object.values(value.checks).some(ok => ok !== true)) throw Error('A comparison check failed.');
    log(run, ['Snapshot frame: ' + value.snapshot?.frame, 'All comparison checks passed. No audio output.']);
  } catch (error) {
    outcome = run.controller.signal.aborted ? 'Cancelled.' : 'Error: ' + error.message;
    if (!run.controller.signal.aborted) log(run, [outcome]);
  } finally {
    try {await close(run);} catch (error) {if (!run.controller.signal.aborted) outcome = 'Cleanup error: ' + error.message;}
    if (activeRun === run) {
      activeRun = null; inspectButton.disabled = false; stopButton.disabled = true;
      status.textContent = run.controller.signal.aborted ? 'Cancelled.' : outcome;
    }
  }
});
function cancel() {
  if (!activeRun || activeRun.controller.signal.aborted) return;
  const run = activeRun; run.controller.abort(new DOMException('Cancelled', 'AbortError'));
  stopButton.disabled = true; status.textContent = 'Cancelling…';
  void close(run).catch(error => log(run, [error.message]));
}
stopButton.addEventListener('click', cancel);
window.addEventListener('pagehide', cancel);

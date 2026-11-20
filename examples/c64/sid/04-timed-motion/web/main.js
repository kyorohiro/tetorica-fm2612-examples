// SPDX-License-Identifier: BSD-3-Clause
import {createSidAudio} from 'tetorica-fm2612/playground_sid_audio.js';
import {createSidClient} from 'tetorica-fm2612/playground_sid.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const modelSelect = document.getElementById('model');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const traceBody = document.getElementById('traceBody');
const traceSummary = document.getElementById('traceSummary');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Edit this program, then Play again. The complete audio/cleanup host is below.
editor.value = `setBpm(120);
const CH1 = 0; // Physical SID channel indices are zero-based.
sid.initialize();
sid.setVoice(CH1, {waveform:'pulse', pulseWidth:1024,
  attack:0, decay:0, sustain:12, release:3, sync:false, ring:false, test:false});
sid.setFilter({mode:'lowpass', routing:1, cutoff:100, resonance:5,
  volume:8, voice3off:false});
await beat(0.125);

// Each build callback runs once. These programs have independent periods.
const melody = sid.build(b => {
  b.noteOn(CH1, 'E3');
  b.atSeconds(0.12).noteOff(CH1);
  b.atSeconds(0.15).noteOn(CH1, 'G3');
  b.atSeconds(0.27).noteOff(CH1);
  b.atSeconds(0.30).noteOn(CH1, 'A3');
  b.atSeconds(0.42).noteOff(CH1);
  b.atSeconds(0.45).noteOn(CH1, 'B3');
  b.atSeconds(0.57).noteOff(CH1);
});
const pulseMotion = sid.build(b => {
  b.setVoice(CH1, {pulseWidth:512});
  b.atSample(22050).setVoice(CH1, {pulseWidth:2048});
  b.atSeconds(1).setVoice(CH1, {pulseWidth:3584});
  b.atSeconds(1.5).setVoice(CH1, {pulseWidth:2048});
});
const filterMotion = sid.build(b => {
  b.setFilter({cutoff:100});
  b.atSeconds(0.75).setFilter({cutoff:700});
  b.atSeconds(1.5).setFilter({cutoff:1200});
  b.atSeconds(2.25).setFilter({cutoff:300});
});

const snapshot = await sid.captureState();
const before = JSON.stringify(snapshot);
const alternative = sid.build(b => b.setVoice(CH1, {pulseWidth:3072}));
const writesA = await sid.compile(pulseMotion, {initialState:snapshot});
const writesB = await sid.compile(alternative, {initialState:snapshot});
const sameAgain = await sid.compile(pulseMotion, {initialState:snapshot});
const melodyWrites = await sid.compile(melody); // Coherent current renderer state.
const filterWrites = await sid.compile(filterMotion, {initialState:snapshot});
const live = await sid.captureState();
const comparison = {
  pulseWidthA:writesA[0].value | ((writesA[1].value & 15) << 8),
  pulseWidthB:writesB[0].value | ((writesB[1].value & 15) << 8),
  snapshotUnchanged:JSON.stringify(snapshot) === before,
  repeatable:JSON.stringify(writesA) === JSON.stringify(sameAgain),
  liveUnchanged:JSON.stringify(live.state.registers) === JSON.stringify(snapshot.state.registers),
};
if (!comparison.snapshotUnchanged || !comparison.repeatable || !comparison.liveUnchanged)
  throw Error('Compile changed its baseline or live registers');
console.log('COMPARE ' + JSON.stringify(comparison));
console.table([
  ...melodyWrites.map(w => ({pattern:'melody', ...w})),
  ...writesA.map(w => ({pattern:'pulse-motion', ...w})),
  ...filterWrites.map(w => ({pattern:'filter-motion', ...w})),
  ...writesB.map(w => ({pattern:'comparison', ...w})),
]);

await sid.schedule(melody, {name:'melody', repeatSeconds:0.6});
await sid.schedule(pulseMotion, {name:'pulse-motion', repeatSeconds:2});
await sid.schedule(filterMotion, {name:'filter-motion', repeatSeconds:3});
console.log('PERIODS melody=0.6s pulse-motion=2s filter-motion=3s');
await beat(8); // Four seconds at 120 BPM. Only this lifetime follows BPM.
for (const name of ['melody', 'pulse-motion', 'filter-motion']) await sid.clearSchedule(name);
sid.noteOff(CH1);
await beat(0.25);
console.log('All three reservations cancelled.');`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 800));
  if (run.messages.length > 20) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

function displayTrace(run, rows) {
  if (activeRun !== run) return;
  if (!Array.isArray(rows)) { report(run, [rows]); return; }
  traceBody.replaceChildren();
  for (const write of rows.slice(0, 64)) {
    const tr = document.createElement('tr');
    const values = [write.pattern, write.offsetSeconds, write.register, write.value, write.operationIndex];
    values.forEach((value, column) => {
      const td = document.createElement('td');
      td.textContent = typeof value !== 'number' ? String(value ?? '')
        : (column === 2 || column === 3) ? '0x' + value.toString(16).padStart(2, '0')
        : column === 1 ? value.toFixed(6) : String(value);
      tr.append(td);
    });
    tr.dataset.register = String(write.register);
    tr.dataset.value = String(write.value);
    tr.dataset.offsetSeconds = String(write.offsetSeconds);
    traceBody.append(tr);
  }
  traceSummary.textContent = `${rows.length} writes · first ${Math.min(64, rows.length)} shown. Full array: browser console.`;
}

// This timer advances only musical steps on Main. Scheduled register changes
// remain one compact reservation on the Worklet's sample clock.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('Wait expects 0..3600 seconds');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const finish = () => {signal.removeEventListener('abort', abort); resolve();};
    const timer = setTimeout(finish, seconds * 1000);
    function abort() {clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

// Stop remains prompt even if fetching/creating an endpoint is still pending.
// A late endpoint is separately disposed by the factory continuation below.
function abortable(promise, signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => {signal.removeEventListener('abort', abort); reject(signal.reason);};
    signal.addEventListener('abort', abort, {once: true});
    Promise.resolve(promise).then(value => {
      signal.removeEventListener('abort', abort);
      if (signal.aborted) reject(signal.reason); else resolve(value);
    }, error => {signal.removeEventListener('abort', abort); reject(error);});
  });
}

function closeAudio(run) {
  if (run.closing) return run.closing;
  run.closing = (async () => {
    // Silence before cancelling so a final already-due write cannot leak out.
    if (run.gain) run.gain.gain.value = 0;
    if (run.sid && !run.controller.signal.aborted) {
      for (const name of ['melody', 'pulse-motion', 'filter-motion']) {
        try {await abortable(run.sid.clearSchedule(name), run.controller.signal);} catch {}
      }
      try {run.sid.allNotesOff();} catch {}
    }
    run.unwatch?.();
    try {await run.sid?.dispose();}
    finally {
      run.endpoint?.dispose(); run.gain?.disconnect();
      if (run.context && run.context.state !== 'closed') await run.context.close();
    }
  })();
  return run.closing;
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), model:modelSelect.value, messages: [], context: null, gain: null,
    endpoint: null, sid: null, closing: null, unwatch: null, failure: null};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false; modelSelect.disabled = true;
  status.textContent = 'Loading…'; detail.textContent = ''; traceBody.replaceChildren();
  traceSummary.textContent = 'No compiled writes yet.';
  const fail = error => {
    if (activeRun !== run || signal.aborted) return;
    run.failure = error instanceof Error ? error : new Error(String(error));
    run.controller.abort(run.failure);
    void closeAudio(run).catch(cleanup => report(run, ['Cleanup error:', cleanup.message]));
  };
  try {
    // Invalid JavaScript is rejected before opening audio.
    const execute = new AsyncFunction('sid', 'setBpm', 'beat', 'console', `'use strict';\n${editor.value}`);
    let bpm = 120;
    const setBpm = value => {
      if (!Number.isFinite(value) || value <= 0 || value > 1000) throw new RangeError('BPM must be in 0..1000');
      bpm = value;
    };
    const beat = beats => {
      if (!Number.isFinite(beats) || beats < 0) throw new RangeError('Beats must be nonnegative');
      return sleep(beats * 60 / bpm, signal);
    };
    run.context = new AudioContext();
    const contextState = () => {
      if (run.context.state === 'closed' && !run.closing && !signal.aborted) fail(new Error('AudioContext was closed'));
    };
    run.context.addEventListener('statechange', contextState);
    run.unwatch = () => run.context.removeEventListener('statechange', contextState);
    run.gain = run.context.createGain(); run.gain.gain.value = 0.35;
    run.gain.connect(run.context.destination);
    await abortable(run.context.resume(), signal);
    const loading = createSidAudio(run.context, run.gain, {model:run.model, signal}).then(endpoint => {
      if (signal.aborted || activeRun !== run) {endpoint.dispose(); throw signal.reason ?? new DOMException('Stopped', 'AbortError');}
      run.endpoint = endpoint; return endpoint;
    });
    const endpoint = await abortable(loading, signal);
    run.sid = createSidClient(endpoint.port, endpoint);
    const diagnostic = event => {
      if (event.data?.type === 'sid-timed-error') fail(new Error(event.data.message));
    };
    const processorError = () => fail(new Error('SID AudioWorklet failed'));
    const fatalDiagnostic = event => {
      if (event.data?.fatal || event.data?.error && event.data.id == null) fail(new Error(event.data.error ?? 'SID AudioWorklet failed'));
    };
    endpoint.port.addEventListener('message', diagnostic); endpoint.port.start();
    endpoint.node.addEventListener('processorerror', processorError);
    endpoint.node.port.addEventListener('message', fatalDiagnostic);
    const unwatchContext = run.unwatch;
    run.unwatch = () => {
      unwatchContext?.();
      endpoint.port.removeEventListener('message', diagnostic);
      endpoint.node.removeEventListener('processorerror', processorError);
      endpoint.node.port.removeEventListener('message', fatalDiagnostic);
    };
    signal.throwIfAborted();
    status.textContent = 'Playing…';
    report(run, ['SID ' + run.model, run.context.sampleRate + ' Hz output', 'software timed operations']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {
      console[method](...values); report(run, values);
    }]));
    output.table = rows => {console.table(rows); displayTrace(run, rows);};
    await abortable(execute(run.sid, setBpm, beat, output), signal);
    signal.throwIfAborted();
  } catch (error) {
    result = run.failure ? `Error: ${run.failure.message}`
      : signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (result.startsWith('Error:')) report(run, [result]);
  } finally {
    try {await closeAudio(run);}
    catch (error) {result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]);}
    if (activeRun === run) {
      activeRun = null; playButton.disabled = false; stopButton.disabled = true; modelSelect.disabled = false;
      status.textContent = result;
    }
  }
});

function stop() {
  const run = activeRun;
  if (!run || run.controller.signal.aborted) return;
  run.controller.abort(new DOMException('Stopped', 'AbortError'));
  stopButton.disabled = true; status.textContent = 'Stopping…';
  void closeAudio(run).catch(error => report(run, ['Stop cleanup:', error.message]));
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

// SPDX-License-Identifier: BSD-3-Clause
import {createWonderSwanAudio} from 'tetorica-fm2612/playground_wonderswan_audio.js';
import {createWonderSwanClient} from 'tetorica-fm2612/playground_wonderswan.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const traceBody = document.getElementById('traceBody');
const traceSummary = document.getElementById('traceSummary');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Edit this program, then Play again. The complete audio/cleanup host is below.
editor.value = `setBpm(120);
const CH1 = 0, CH2 = 1; // Physical channels are zero-based.
ws.initialize();
ws.setWaveform(CH1, Array.from({length:32}, (_, i) =>
  Math.round(7.5 + 7.5 * Math.sin(i * Math.PI / 16))));
ws.setNote(CH1, 'E3'); ws.setVolume(CH1, 9, 9);
// Allow immediate initialization to reach the Worklet before the snapshot.
await beat(0.125);

const snapshot = await ws.captureState();
const before = JSON.stringify(snapshot);
const phrase = ws.build(b => {
  b.setPan(CH1, 12, 0).keyOn(CH1);
  b.atSample(4410).setPan(CH1, 0, 12); // 0.1 s at the reference 44100 Hz.
  b.atSeconds(0.25).setPan(CH1, 9, 9);
  b.atSeconds(0.5).setNoise({enabled:true, type:3, reset:true});
  b.atSeconds(0.75).keyOff(CH1);
});
const alternative = ws.build(b => b.setPan(CH1, 0, 12).keyOn(CH1));
const writesA = await ws.compile(phrase, {initialState:snapshot});
const writesB = await ws.compile(alternative, {initialState:snapshot});
console.table(writesA);
const live = await ws.captureState();
const comparison = {
  firstA:writesA[0].value, firstB:writesB[0].value,
  snapshotUnchanged:JSON.stringify(snapshot) === before,
  liveUnchanged:JSON.stringify(live.state.registers) === JSON.stringify(snapshot.state.registers),
};
if (!comparison.snapshotUnchanged || !comparison.liveUnchanged) throw Error('Compile mutated state');
console.log('COMPARE ' + JSON.stringify(comparison));

await ws.schedule(phrase, {name:'pan-gate', repeatSeconds:1});
// A later manual writer starts CH2. Scheduled R90 edits must preserve its Gate.
ws.setVolume(CH2, 0); ws.keyOn(CH2);
await beat(1.25); // 0.625 s at 120 BPM: after the shared Noise-mode write.
const during = await ws.captureState();
if (!(during.state.registers[0x10] & 2)) throw Error('Scheduled write erased manual CH2 Gate');
console.log('Manual CH2 Gate kept: ' + during.state.registers[0x10]);
await beat(2.75);
await ws.clearSchedule('pan-gate');
ws.keyOff(CH1); ws.keyOff(CH2);
await beat(0.25);
console.log('Reservation cancelled. Raw Gate off has no software Envelope.');`;

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
  for (const write of rows.slice(0, 32)) {
    const tr = document.createElement('tr');
    const values = [write.offsetSeconds, write.register, write.value, write.operationIndex];
    values.forEach((value, column) => {
      const td = document.createElement('td');
      td.textContent = typeof value !== 'number' ? String(value ?? '')
        : (column === 1 || column === 2) ? '0x' + value.toString(16).padStart(2, '0')
        : column === 0 ? value.toFixed(6) : String(value);
      tr.append(td);
    });
    tr.dataset.register = String(write.register);
    tr.dataset.value = String(write.value);
    tr.dataset.offsetSeconds = String(write.offsetSeconds);
    traceBody.append(tr);
  }
  traceSummary.textContent = `${rows.length} writes · first ${Math.min(32, rows.length)} shown. Full array: browser console.`;
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
    if (run.ws && !run.controller.signal.aborted) {
      try {await abortable(run.ws.clearSchedule('pan-gate'), run.controller.signal);} catch {}
      try {for (let channel = 0; channel < 4; channel++) run.ws.keyOff(channel);} catch {}
    }
    run.unwatch?.();
    try {run.ws?.dispose();}
    finally {
      run.endpoint?.dispose(); run.gain?.disconnect();
      if (run.context && run.context.state !== 'closed') await run.context.close();
    }
  })();
  return run.closing;
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), messages: [], context: null, gain: null,
    endpoint: null, ws: null, closing: null, unwatch: null, failure: null};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = ''; traceBody.replaceChildren();
  traceSummary.textContent = 'No compiled writes yet.';
  const fail = error => {
    if (signal.aborted) return;
    run.failure = error instanceof Error ? error : new Error(String(error));
    run.controller.abort(run.failure);
    void closeAudio(run).catch(cleanup => report(run, ['Cleanup error:', cleanup.message]));
  };
  try {
    // Invalid JavaScript is rejected before opening audio.
    const execute = new AsyncFunction('ws', 'setBpm', 'beat', 'console', `'use strict';\n${editor.value}`);
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
    run.gain = run.context.createGain(); run.gain.gain.value = 0.45;
    run.gain.connect(run.context.destination);
    await abortable(run.context.resume(), signal);
    const loading = createWonderSwanAudio(run.context, run.gain).then(endpoint => {
      if (signal.aborted || activeRun !== run) {endpoint.dispose(); throw signal.reason ?? new DOMException('Stopped', 'AbortError');}
      run.endpoint = endpoint; return endpoint;
    });
    const endpoint = await abortable(loading, signal);
    run.ws = createWonderSwanClient(endpoint.port);
    const diagnostic = event => {
      if (event.data?.type === 'wonderswan-timed-error') fail(new Error(event.data.message));
    };
    const processorError = () => fail(new Error('WonderSwan AudioWorklet failed'));
    const fatalDiagnostic = event => {
      if (event.data?.fatal || event.data?.error && event.data.id == null) fail(new Error(event.data.error ?? 'WonderSwan AudioWorklet failed'));
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
    report(run, ['WonderSwan', run.context.sampleRate + ' Hz output', 'software timed operations']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {
      console[method](...values); report(run, values);
    }]));
    output.table = rows => {console.table(rows); displayTrace(run, rows);};
    await abortable(execute(run.ws, setBpm, beat, output), signal);
    signal.throwIfAborted();
  } catch (error) {
    result = run.failure ? `Error: ${run.failure.message}`
      : signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (result.startsWith('Error:')) report(run, [result]);
  } finally {
    try {await closeAudio(run);}
    catch (error) {result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]);}
    if (activeRun === run) {
      activeRun = null; playButton.disabled = false; stopButton.disabled = true;
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

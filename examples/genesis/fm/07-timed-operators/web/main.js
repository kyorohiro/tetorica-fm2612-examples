// SPDX-License-Identifier: BSD-3-Clause
import {createOpnAudio} from 'tetorica-fm2612/playground_opn_audio.js';
import {createOpnClient} from 'tetorica-fm2612/playground_opn.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const engineInput = document.getElementById('engine');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const traceBody = document.getElementById('traceBody');
const traceSummary = document.getElementById('traceSummary');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Edit this program, then Play again. The complete audio/cleanup host is below.
editor.value = `setBpm(120);
const CH1 = 0, OP1 = 0; // This API uses physical channels / logical operators from 0.
fm.setAlgo(CH1, 7); // Four independent carriers; only OP1 is audible here.
fm.setPan(CH1, true, true);
fm.setOperators(CH1, [
  [OP1, {dt: 0, multi: 1, tl: 32, ar: 31, d1r: 0, d2r: 0, sl: 0, rr: 8}],
  [1, {tl: 127}], [2, {tl: 127}], [3, {tl: 127}],
]);

// Software timing. YM2612 supplies the operator and envelope behavior.
// This period stays in seconds when the musical BPM changes.
const motionSeconds = 1.5;
const motion = fm.build(b => {
  for (let i = 0; i < 32; i++) {
    const wave = (1 - Math.cos(i / 32 * Math.PI * 2)) / 2;
    b.atSeconds(i / 32 * motionSeconds).setOperator(CH1, OP1, {
      tl: Math.round(24 + 32 * wave),
      multi: 1 + Math.round(3 * wave),
    });
  }
});

// Inspect one predicted pass. This does not write to the live chip.
const writes = await fm.compile(motion, {initialState: 'client'});
console.table(writes);
console.log('Predicted trace:', writes.length, 'writes; build did not change the chip.');
await fm.schedule(motion, {name: 'operator-motion', repeatSeconds: motionSeconds});
console.log('Operator motion accepted:', motionSeconds, 'seconds per cycle.');

// The melody has its own musical clock; no per-register JavaScript timer.
// Changing setBpm() changes note spacing without changing motionSeconds.
const notes = ['E2','G2','A2','B2','D3','E3','G3','E3',
               'D3','B2','A2','G2','E2','D2','B1','E2'];
for (const note of notes) {
  fm.noteOn(CH1, note);
  await beat(0.5);
  fm.noteOff(CH1);
  await beat(0.125);
}

// Cancellation stops future writes; already-applied register values remain.
await fm.clearSchedule('operator-motion');
fm.noteOff(CH1);
await beat(0.5);
console.log('Motion cancelled; final note released.');`;

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
    const values = [write.offsetSeconds, write.port, write.register, write.value];
    values.forEach((value, column) => {
      const td = document.createElement('td');
      td.textContent = typeof value !== 'number' ? String(value ?? '')
        : column >= 2 ? '0x' + value.toString(16).padStart(2, '0')
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
    if (run.fm && !run.controller.signal.aborted) {
      try {await abortable(run.fm.clearSchedule('operator-motion'), run.controller.signal);} catch {}
      try {for (let channel = 0; channel < 6; channel++) run.fm.keyOff(channel);} catch {}
    }
    run.unwatch?.();
    try {run.fm?.dispose();}
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
    endpoint: null, fm: null, closing: null, unwatch: null, failure: null};
  activeRun = run;
  const {signal} = run.controller, engine = engineInput.value;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false; engineInput.disabled = true;
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
    const execute = new AsyncFunction('fm', 'setBpm', 'beat', 'console', `'use strict';\n${editor.value}`);
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
    const loading = createOpnAudio(run.context, run.gain, 'ym2612', {engine}).then(endpoint => {
      if (signal.aborted || activeRun !== run) {endpoint.dispose(); throw signal.reason ?? new DOMException('Stopped', 'AbortError');}
      run.endpoint = endpoint; return endpoint;
    });
    const endpoint = await abortable(loading, signal);
    run.fm = createOpnClient('ym2612', endpoint.port, {engine});
    const diagnostic = event => {
      if (event.data?.type === 'ym2612-timed-error') fail(new Error(event.data.message));
    };
    const processorError = () => fail(new Error('YM2612 AudioWorklet failed'));
    const fatalDiagnostic = event => {
      if (event.data?.fatal || event.data?.error && event.data.id == null) fail(new Error(event.data.error ?? 'YM2612 AudioWorklet failed'));
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
    report(run, [engine, run.context.sampleRate + ' Hz output', 'software timed operations']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {
      console[method](...values); report(run, values);
    }]));
    output.table = rows => {console.table(rows); displayTrace(run, rows);};
    await abortable(execute(run.fm, setBpm, beat, output), signal);
    signal.throwIfAborted();
  } catch (error) {
    result = run.failure ? `Error: ${run.failure.message}`
      : signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (result.startsWith('Error:')) report(run, [result]);
  } finally {
    try {await closeAudio(run);}
    catch (error) {result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]);}
    if (activeRun === run) {
      activeRun = null; playButton.disabled = false; stopButton.disabled = true; engineInput.disabled = false;
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

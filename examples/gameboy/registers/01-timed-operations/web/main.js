// SPDX-License-Identifier: BSD-3-Clause
import {createGameboyAudio} from 'tetorica-fm2612/playground_gameboy_audio.js';
import {createGameboyClient} from 'tetorica-fm2612/playground_gameboy.js';

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
const CH1 = 0; // Pulse CH1; Wave is physical CH3, Noise is CH4.
gb.initialize();
// The ordered capture observes initialization; it does not pause audio.
const snapshot = await gb.captureState();
const before = JSON.stringify(snapshot);
let builds = 0;
const pulse = gb.build(b => {
  builds++;
  b.pulse.setEnvelope(CH1, {volume:9, direction:'down', period:0});
  b.pulse.setDuty(CH1, .25).pulse.noteOn(CH1, 'E4');
  b.atSample(5512).pulse.setDuty(CH1, .5); // About 0.125 s at reference 44100 Hz.
  b.atSeconds(.2).pulse.keyOff(CH1);
  b.atSeconds(.25).pulse.noteOn(CH1, 'G4');
  b.atSeconds(.45).pulse.keyOff(CH1);
});
const triangle = Array.from({length:32}, (_, i) => i < 16 ? i : 31 - i);
const square = Array.from({length:32}, (_, i) => i < 16 ? 12 : 3);
const wave = gb.build(b => {
  builds++;
  // Upload stops the real CH3 DAC. Retrigger AFTER each upload.
  b.wave.stopAndSetWaveform(triangle).wave.setLevel(.25).wave.noteOn('C3');
  b.atSeconds(.3).wave.stopAndSetWaveform(square).wave.noteOn('E3');
  b.atSeconds(.6).wave.keyOff();
});
const noise = gb.build(b => {
  builds++;
  b.noise.setEnvelope({volume:6, direction:'down', period:1});
  b.noise.setParameters({divisor:3, shift:4, width:15}).noise.keyOn();
  b.atSeconds(.0625).noise.setParameters({shift:2, width:7});
  b.atSeconds(.125).noise.keyOff();
});
const alternative = gb.build(b => b.pulse.setDuty(CH1, .75));
const writes = await gb.compile(pulse, {initialState:snapshot});
const again = await gb.compile(pulse, {initialState:snapshot});
const current = await gb.compile(pulse); // A second coherent renderer capture.
const waveWrites = await gb.compile(wave, {initialState:snapshot});
const noiseWrites = await gb.compile(noise, {initialState:snapshot});
const alternativeWrites = await gb.compile(alternative, {initialState:snapshot});
// One labelled table keeps all three voices visible on the page.
console.table([
  ...writes.map(row => ({pattern:'Pulse', ...row})),
  ...waveWrites.map(row => ({pattern:'Wave', ...row})),
  ...noiseWrites.map(row => ({pattern:'Noise', ...row})),
  ...alternativeWrites.map(row => ({pattern:'Alternative', ...row})),
]);
console.log('Pulse / Wave / Noise use physical channels 1 / 3 / 4.');
const live = await gb.captureState();
const comparison = {
  builds, snapshotUnchanged:JSON.stringify(snapshot) === before,
  reusedTrace:JSON.stringify(writes) === JSON.stringify(again),
  currentTrace:JSON.stringify(writes) === JSON.stringify(current),
  liveUnchanged:JSON.stringify(live.state) === JSON.stringify(snapshot.state),
};
if (builds !== 3 || Object.values(comparison).some(value => value === false))
  throw Error('Build/compile changed live state or its baseline');
console.log('COMPARE ' + JSON.stringify(comparison));
console.log('PERIODS ' + JSON.stringify({pulse:.5, wave:.75, noise:.25}));
await gb.schedule(pulse, {name:'dmg-pulse', repeatSeconds:.5});
await gb.schedule(wave, {name:'dmg-wave', repeatSeconds:.75});
await gb.schedule(noise, {name:'dmg-noise', repeatSeconds:.25});
// Change BPM to change how long this ordinary beat wait lasts.
// The three reservations keep their own explicit seconds/sample clocks.
await beat(8);
await gb.clearSchedule('dmg-pulse');
await gb.clearSchedule('dmg-wave');
await gb.clearSchedule('dmg-noise');
await beat(.25);
console.log('Reservation cancelled. Wave uploads and raw keyOff use hardware behavior.');`;

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
  for (const write of rows.slice(0, 96)) {
    const tr = document.createElement('tr');
    const values = [write.pattern ?? 'Trace', write.offsetSeconds, write.register, write.value, write.operationIndex];
    values.forEach((value, column) => {
      const td = document.createElement('td');
      td.textContent = typeof value !== 'number' ? String(value ?? '')
        : column === 2 ? '0x' + value.toString(16).padStart(2, '0') + ' / FF' + (0x10 + value).toString(16).padStart(2, '0').toUpperCase()
        : column === 3 ? '0x' + value.toString(16).padStart(2, '0')
        : column === 1 ? value.toFixed(6) : String(value);
      tr.append(td);
    });
    tr.dataset.register = String(write.register);
    tr.dataset.value = String(write.value);
    tr.dataset.offsetSeconds = String(write.offsetSeconds);
    traceBody.append(tr);
  }
  traceSummary.textContent = `${rows.length} writes · first ${Math.min(96, rows.length)} shown. Full array: browser console.`;
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
    if (run.gb && !run.controller.signal.aborted) {
      for (const name of ['dmg-pulse','dmg-wave','dmg-noise']) {
        try {await abortable(run.gb.clearSchedule(name), run.controller.signal);} catch {}
      }
      try {for (let channel = 0; channel < 4; channel++) run.gb.keyOff(channel);} catch {}
    }
    run.unwatch?.();
    try {await run.gb?.dispose();}
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
    endpoint: null, gb: null, closing: null, unwatch: null, failure: null};
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
    const execute = new AsyncFunction('gb', 'setBpm', 'beat', 'console', `'use strict';\n${editor.value}`);
    let bpm = 120;
    const setBpm = value => {
      if (!Number.isFinite(value) || value <= 0 || value > 1000) throw new RangeError('BPM must be in 0..1000');
      bpm = value;
    };
    const beat = beats => {
      if (!Number.isFinite(beats) || beats < 0) throw new RangeError('Beats must be nonnegative');
      return sleep(beats * 60 / bpm, signal);
    };
    const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!Context) throw Error('This example needs Web Audio and AudioWorklet');
    run.context = new Context();
    const contextState = () => {
      if (run.context.state === 'closed' && !run.closing && !signal.aborted) fail(new Error('AudioContext was closed'));
    };
    run.context.addEventListener('statechange', contextState);
    run.unwatch = () => run.context.removeEventListener('statechange', contextState);
    run.gain = run.context.createGain(); run.gain.gain.value = 0.25;
    run.gain.connect(run.context.destination);
    await abortable(run.context.resume(), signal);
    const loading = createGameboyAudio(run.context, run.gain).then(endpoint => {
      if (signal.aborted || activeRun !== run) {endpoint.dispose(); throw signal.reason ?? new DOMException('Stopped', 'AbortError');}
      run.endpoint = endpoint; return endpoint;
    });
    const endpoint = await abortable(loading, signal);
    run.gb = createGameboyClient(endpoint.port);
    const diagnostic = event => {
      if (event.data?.type === 'gameboy-timed-error') fail(new Error(event.data.message));
    };
    const processorError = () => fail(new Error('Game Boy AudioWorklet failed'));
    const fatalDiagnostic = event => {
      if (event.data?.fatal || event.data?.error && event.data.id == null) fail(new Error(event.data.error ?? 'Game Boy AudioWorklet failed'));
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
    report(run, ['Game Boy', run.context.sampleRate + ' Hz output', 'software timed operations']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {
      console[method](...values); report(run, values);
    }]));
    output.table = rows => {console.table(rows); displayTrace(run, rows);};
    await abortable(execute(run.gb, setBpm, beat, output), signal);
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

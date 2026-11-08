import {createSidAudio} from 'tetorica-fm2612/playground_sid_audio.js';
import {createSidClient} from 'tetorica-fm2612/playground_sid.js';

const OUTPUT_GAIN = 0.35; // One explicit host gain; no normalization.
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const modelSelect = document.getElementById('model');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Each Play creates one SID. Change the model and replay this exact same code.
editor.value = `const {sid} = await startAudio();
sid.initialize(); // 3 physical oscillators, shared filter, initially Gate off.
sid.setFilter({mode: 'off', routing: 0, volume: 10}); // Dry output.
sid.setVoice(0, {waveform: 'triangle', attack: 0, decay: 4, sustain: 10, release: 4});
sid.setVoice(1, {waveform: 'saw', attack: 4, decay: 6, sustain: 8, release: 5});
sid.setVoice(2, {waveform: 'pulse', pulseWidth: 1024, attack: 7, decay: 3, sustain: 11, release: 6});
const notes = ['A4', 'E4', 'A3']; // A4 = 440 Hz; no song or external instrument.

for (let channel = 0; channel < 3; channel++) {
  console.log('CH' + (channel + 1) + ' solo: ' + notes[channel]);
  sid.noteOn(channel, notes[channel]);
  await sleep(0.45);
  sid.keyOff(channel); // Gate controls ADSR, not the oscillator phase.
  await sleep(0.30);
}
console.log('All three voices: triangle + saw + pulse');
for (let channel = 0; channel < 3; channel++) sid.noteOn(channel, notes[channel]);
await sleep(1.20);
sid.allNotesOff();
await sleep(0.60); // Hear the release before the endpoint is closed.`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// These timers place note edges only. SID clocks and PCM run in AudioWorklet.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep(seconds) expects 0..3600');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, seconds * 1000);
    function abort() { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason); }
    signal.addEventListener('abort', abort, {once: true});
  });
}

function closeAudio(run) {
  if (run.cleanup) return run.cleanup;
  run.closing = true;
  run.cleanup = (async () => {
    // Include an endpoint that finishes loading after Stop was pressed.
    try { await run.initializing; } catch { /* Reported by the Play handler. */ }
    try {
      try { run.sid?.allNotesOff(); } catch { /* Edited code may not initialize. */ }
      try { run.sid?.dispose(); } finally { run.endpoint?.dispose(); }
    } finally {
      try { run.gain?.disconnect(); }
      finally { if (run.context && run.context.state !== 'closed') await run.context.close(); }
    }
  })();
  return run.cleanup;
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), model: modelSelect.value, context: null, gain: null,
    endpoint: null, sid: null, initializing: null, cleanup: null, closing: false, started: false,
    failure: null, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false; modelSelect.disabled = true;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Syntax errors allocate no audio resources. Resume inside the Play gesture.
    const execute = new AsyncFunction('startAudio', 'sleep', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    await run.context.resume();
    signal.throwIfAborted();
    run.gain = run.context.createGain(); run.gain.gain.value = OUTPUT_GAIN;
    run.gain.connect(run.context.destination);
    function startAudio() {
      signal.throwIfAborted();
      if (run.started || run.closing) throw new Error('Call startAudio() once per Play');
      run.started = true;
      run.initializing = (async () => {
        // Dedicated public SID API; default module-relative WASM/Worklet URLs.
        const endpoint = await createSidAudio(run.context, run.gain, {model: run.model, signal,
          onError(error) {
            run.failure = error; report(run, ['Audio error:', error.message]);
            run.controller.abort(error); void closeAudio(run).catch(() => {});
          }});
        run.endpoint = endpoint;
        signal.throwIfAborted();
        const sid = createSidClient(endpoint.port, {model: endpoint.model, clock: endpoint.clock});
        run.sid = sid;
        status.textContent = 'Playing…';
        report(run, ['SID ' + run.model + (run.model === '8580' ? ' Preview' : ''),
          endpoint.clock + ' Hz clock', run.context.sampleRate + ' Hz PCM', 'AudioWorklet', 'mono', 'gain ' + OUTPUT_GAIN]);
        return {sid, context: run.context};
      })();
      return run.initializing;
    }
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method,
      (...values) => { console[method](...values); report(run, values); }]));
    await execute(startAudio, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
  } catch (error) {
    result = run.failure ? `Error: ${run.failure.message}` : signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, [result]);
  } finally {
    try { await closeAudio(run); }
    catch (error) { if (!signal.aborted) { result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]); } }
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
  void closeAudio(run).catch(error => report(run, [`Stop cleanup: ${error?.message ?? String(error)}`]));
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

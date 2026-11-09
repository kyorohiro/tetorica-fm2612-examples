import {createPs1Audio} from 'tetorica-fm2612/playground_ps1_audio.js';
import {createPs1Client} from 'tetorica-fm2612/playground_ps1.js';
import {encodePs1AdpcmCycle} from 'tetorica-fm2612/ps1_adpcm_encoder.js';

const OUTPUT_GAIN = 0.6; // One explicit host gain; no normalization.
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Each Play creates an independent SPU; sample preparation stays on the UI side.
editor.value = `const {spu} = await startAudio();
spu.reset({clearRam: true});
// SOFTWARE preparation: an original 112-point PCM cycle -> four SPU ADPCM packets.
const pcm = Float32Array.from({length: 112}, (_, i) => 0.55 * Math.sin(i * 2 * Math.PI / 112));
const encoded = encodePs1AdpcmCycle(pcm);
const sample = await spu.loadADPCM(encoded.adpcm, {
  baseFrequencyHz: 44100 / 112, loopStartSamples: 0,
}); // Tuning is explicit: PITCH 4096 plays one source frame per native frame.
spu.setPreset(0, {sample, volumeLeft: 0.28, volumeRight: 0.28});
applyControls(); // Named ADSR codes from the live controls, not milliseconds.
console.log(encoded.sourceFrames + ' PCM frames -> ' + encoded.adpcm.length + ' ADPCM bytes');
spu.noteOn(0, 'A4');
await sleep(4.0); // Try changing Sustain rate while holding this note.
spu.keyOff(0);
await sleep(0.3);
for (const note of ['C4', 'E4', 'G4']) {
  spu.noteOn(0, note); await sleep(0.35);
  spu.keyOff(0); await sleep(0.15);
}
spu.allNotesOff(); await sleep(0.2);`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// These timers place note edges only. SPU clocks and PCM run in AudioWorklet.
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
      try { run.spu?.allNotesOff(); } catch { /* Edited code may not initialize. */ }
      try { run.spu?.dispose(); } finally { run.endpoint?.dispose(); run.endpoint?.port.close(); }
    } finally {
      try { run.gain?.disconnect(); }
      finally { if (run.context && run.context.state !== 'closed') await run.context.close(); }
    }
  })();
  return run.cleanup;
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), context: null, gain: null,
    endpoint: null, spu: null, initializing: null, cleanup: null, closing: false, started: false,
    failure: null, controlsReady: false, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Syntax errors allocate no audio resources. Resume inside the Play gesture.
    const execute = new AsyncFunction('startAudio', 'encodePs1AdpcmCycle', 'applyControls', 'sleep', 'console', `'use strict';\n${editor.value}`);
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
        // Dedicated public SPU API; default package-relative WASM/Worklet URLs.
        const endpoint = await createPs1Audio(run.context, run.gain, {signal,
          onError(error) {
            run.failure = error; report(run, ['Audio error:', error.message]);
            run.controller.abort(error); void closeAudio(run).catch(() => {});
          }});
        run.endpoint = endpoint;
        signal.throwIfAborted();
        const spu = createPs1Client(endpoint.port, {sampleRate: endpoint.sampleRate, state: endpoint.state});
        run.spu = spu;
        status.textContent = 'Playing…';
        report(run, ['PS1 SPU', 'native 44100 Hz', run.context.sampleRate + ' Hz device PCM', 'AudioWorklet', 'gain ' + OUTPUT_GAIN]);
        return {spu, context: run.context};
      })();
      return run.initializing;
    }
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method,
      (...values) => { console[method](...values); report(run, values); }]));
    await execute(startAudio, encodePs1AdpcmCycle, () => applyControls(run), seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
  } catch (error) {
    result = run.failure ? `Error: ${run.failure.message}` : signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, [result]);
  } finally {
    try { await closeAudio(run); }
    catch (error) { if (!signal.aborted) { result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]); } }
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
  void closeAudio(run).catch(error => report(run, [`Stop cleanup: ${error?.message ?? String(error)}`]));
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

function envelopeSettings() {
  return {attackRate: Number(document.getElementById('attack').value), attackExponential: false,
    decayRate: Number(document.getElementById('decay').value), sustainLevel: Number(document.getElementById('sustain').value),
    sustainRate: Number(document.getElementById('sustain-rate').value), sustainDecrease: true,
    sustainExponential: false, releaseRate: Number(document.getElementById('release').value), releaseExponential: false};
}
function applyControls(run) {
  run.controller.signal.throwIfAborted();
  if (!run.spu || run.closing) throw new Error('Call startAudio() before applyControls()');
  const envelope = envelopeSettings();
  run.spu.setEnvelope(0, envelope, {live: true}); run.controlsReady = true;
  report(run, ['Live ADSR codes', JSON.stringify(envelope)]);
}
function updateControls() {
  for (const id of ['attack', 'decay', 'sustain', 'sustain-rate', 'release'])
    document.getElementById(id + '-value').textContent = document.getElementById(id).value;
  const run = activeRun;
  if (run?.controlsReady && !run.controller.signal.aborted && !run.closing) {
    try { applyControls(run); } catch (error) { report(run, ['Envelope error:', error.message]); }
  }
}
for (const id of ['attack', 'decay', 'sustain', 'sustain-rate', 'release'])
  document.getElementById(id).addEventListener('input', updateControls);
updateControls();

import {createPs1Audio} from 'tetorica-fm2612/playground_ps1_audio.js';
import {createPs1Client} from 'tetorica-fm2612/playground_ps1.js';
import {encodePs1Adpcm} from 'tetorica-fm2612/ps1_adpcm_encoder.js';

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
// SOFTWARE encoding of a finite original recording; no sample loop.
const sourceRate = 44100, sourceFrequency = 220, sourceFrames = Math.round(sourceRate * 0.4);
const pcm = Float32Array.from({length: sourceFrames}, (_, i) => {
  const edge = Math.min(1, i / 220, (sourceFrames - 1 - i) / 220);
  return 0.55 * Math.sin(i * 2 * Math.PI * sourceFrequency / sourceRate) * Math.exp(-3 * i / sourceFrames) * edge;
});
const encoded = encodePs1Adpcm(pcm);
const sample = await spu.loadADPCM(encoded.adpcm, {baseFrequencyHz: sourceFrequency});
for (const channel of [0, 1]) {
  spu.setPreset(channel, {sample, volumeLeft: 0.18, volumeRight: 0.18});
  spu.setEnvelope(channel, {attackRate: 24, decayRate: 7, sustainLevel: 12,
    sustainRate: 127, sustainDecrease: true, releaseRate: 8});
}
applyControls(); // Voice sends + ONE shared preset, independent left/right returns.
console.log('CH1 sends by default; CH2 stays dry. All controls remain live.');
for (let hit = 0; hit < 6; hit++) {
  spu.noteOn(0, ['C5', 'E5', 'G5'][hit % 3]);
  spu.noteOn(1, ['C4', 'G4', 'E4'][hit % 3]);
  await sleep(0.25); spu.allNotesOff();
  await sleep(0.65); // Wet tails continue after the dry envelope has ended.
}
await sleep(0.8); // Stop closes the SPU and clears every tail immediately.`;

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
    const execute = new AsyncFunction('startAudio', 'encodePs1Adpcm', 'applyControls', 'sleep', 'console', `'use strict';\n${editor.value}`);
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
    await execute(startAudio, encodePs1Adpcm, () => applyControls(run), seconds => sleep(seconds, signal), output);
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

function applyControls(run) {
  run.controller.signal.throwIfAborted();
  if (!run.spu || run.closing) throw new Error('Call startAudio() before applyControls()');
  const enabled = document.getElementById('enable-reverb').checked;
  const settings = {preset: enabled ? document.getElementById('preset').value : 'off',
    volumeLeft: Number(document.getElementById('return-left').value), volumeRight: Number(document.getElementById('return-right').value)};
  run.spu.setReverb(settings);
  run.spu.setPreset(0, {reverb: document.getElementById('send0').checked});
  run.spu.setPreset(1, {reverb: document.getElementById('send1').checked});
  run.controlsReady = true;
  report(run, ['Shared reverb', settings.preset, 'L/R returns', settings.volumeLeft, settings.volumeRight]);
}
function updateControls() {
  for (const id of ['return-left', 'return-right'])
    document.getElementById(id + '-value').textContent = Number(document.getElementById(id).value).toFixed(2);
  const run = activeRun;
  if (run?.controlsReady && !run.controller.signal.aborted && !run.closing) {
    try { applyControls(run); } catch (error) { report(run, ['Reverb error:', error.message]); }
  }
}
for (const id of ['return-left', 'return-right']) document.getElementById(id).addEventListener('input', updateControls);
for (const id of ['enable-reverb', 'preset', 'send0', 'send1']) document.getElementById(id).addEventListener('change', updateControls);
updateControls();

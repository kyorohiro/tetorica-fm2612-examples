import {createSoundChip} from 'tetorica-fm2612';
import {WonderSwanSynth} from 'tetorica-fm2612/wonderswansynth.js';
import {WonderSwanWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// This source is editable. Each Play gets a fresh chip and audio context.
editor.value = `const {ws, transport} = await startAudio();
ws.initialize();
ws.setPan(3, 5, 5);
await transport.start();
console.log('Noise uses physical CH3; each type chooses different LFSR taps');
for (const type of [0, 1, 3, 7]) {
  console.log('Noise type', type);
  ws.setNoise({enabled: true, type, reset: true});
  ws.noteOn(3, 'C5'); // Sets the noise clock as well as the channel gate.
  await sleep(0.28);
  ws.keyOff(3);
  await sleep(0.08);
}
ws.setNoise({enabled: false});
console.log('Sweep uses physical CH2; positive register steps raise pitch');
ws.setPan(2, 6, 6);
for (const step of [1, -1]) {
  ws.setSweep({enabled: false});
  ws.setFrequency(2, 440); // Restore the start period before each sweep.
  ws.setSweep({enabled: true, step, time: 2});
  ws.keyOn(2);
  await sleep(0.65);
  ws.keyOff(2);
  await sleep(0.12);
}
ws.setSweep({enabled: false});
ws.allNotesOff();
await sleep(0.1);`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// Only musical edges use a JS timer; Voice PCM bytes run on the audio thread.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep(seconds) expects 0..3600');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {signal.removeEventListener('abort', abort); resolve();}, seconds * 1000);
    function abort() {clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

async function closeAudio(run) {
  try {
    // Clear pending timed PCM before closing so Stop cannot leave queued writes.
    if (run.transport && !run.transport.disposed) {
      try {await run.transport.clearScheduledWrites();} catch { /* Disposal may already be in progress. */ }
      await run.transport.close();
    } else await run.device?.dispose();
  } finally {
    if (!run.contextClosing && run.context && run.context.state !== 'closed') run.contextClosing = run.context.close();
    await run.contextClosing;
  }
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), context: null, contextClosing: null, device: null, transport: null, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Invalid edited code does not create any audio resources.
    const execute = new AsyncFunction('startAudio', 'sleep', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    await run.context.resume(); // Resume from the user's Play gesture.
    signal.throwIfAborted();
    async function startAudio() {
      signal.throwIfAborted();
      if (run.device) throw new Error('Call startAudio() once per Play');
      run.device = await createSoundChip('wonderswan', {execution: 'worklet', audioContext: run.context, signal});
      signal.throwIfAborted();
      run.transport = new WonderSwanWorkletTransport(run.device);
      const ws = new WonderSwanSynth({transport: run.transport, clock: run.device.clock});
      status.textContent = 'Playing…';
      report(run, ['WonderSwan', run.device.clock + ' Hz clock', run.device.sampleRate() + ' Hz PCM', 'AudioWorklet']);
      return {ws, transport: run.transport, context: run.context};
    }
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(startAudio, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    await run.transport?.flush();
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, [result]);
  } finally {
    try {await closeAudio(run);}
    catch (error) {if (!signal.aborted) {result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]);}}
    if (activeRun === run) {
      activeRun = null; playButton.disabled = false; stopButton.disabled = true;
      status.textContent = signal.aborted ? 'Stopped.' : result;
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

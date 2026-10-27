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
ws.initialize(); // Silent defaults. Physical channels are 0..3.
const sine = Array.from({length: 32}, (_, i) => Math.round(7.5 + 7.5 * Math.sin(i * Math.PI / 16)));
const triangle = Array.from({length: 32}, (_, i) => i < 16 ? i : 31 - i);
const saw = Array.from({length: 32}, (_, i) => Math.floor(i / 2));
const pulse = Array.from({length: 32}, (_, i) => i < 8 ? 15 : 0);
for (const [ch, wave] of [sine, triangle, saw, pulse].entries()) ws.setWaveform(ch, wave);
ws.setPan(0, 7, 3); ws.setPan(1, 3, 7);
ws.setPan(2, 5, 5); ws.setPan(3, 3, 3);
await transport.start();
console.log('4 channels; 32 samples of 0..15; A4 = 440 Hz');
const lead = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A5', 'G5'];
for (let i = 0; i < lead.length; i++) {
  ws.noteOn(0, lead[i]);
  ws.noteOn(1, i < 4 ? 'E4' : 'F4');
  ws.noteOn(2, i < 4 ? 'C3' : 'D3');
  ws.noteOn(3, i % 2 ? 'G3' : 'C4');
  await sleep(0.32);
  ws.allNotesOff();
  await sleep(0.08);
}
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

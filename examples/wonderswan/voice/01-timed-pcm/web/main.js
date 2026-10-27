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
editor.value = `// Prepare the complete bounded PCM before creating or starting the chip.
// Game assets, a file decoder and per-byte JavaScript timers are unnecessary.
const pcmRate = 12000;
const pcm = new Uint8Array(pcmRate);
let phase = 0;
for (let i = 0; i < pcm.length; i++) {
  const hz = [220, 330, 440][Math.min(2, Math.floor(i / 4000))];
  const edge = Math.min(1, i / 120, (pcm.length - 1 - i) / 360);
  phase += 2 * Math.PI * hz / pcmRate;
  pcm[i] = Math.round(128 + 80 * edge * Math.sin(phase));
}
const {ws, transport, context} = await startAudio();
ws.initialize();
ws.setVoiceMode(true); // Replaces the wavetable of physical CH1, not a fifth voice.
ws.writeVoice(128); // Unsigned PCM: 0..255, centered at 128.
ws.writeRegister(0x94, 15); // Full left/right Voice routing, independent of PCM bytes.
await transport.flush();
const start = context.currentTime + 0.15;
const entries = [{time: start, port: 0, register: 0x90, value: 0x22}];
for (let i = 0; i < pcm.length; i++) {
  entries.push({time: start + i / pcmRate, port: 0, register: 0x89, value: pcm[i]});
}
entries.push({time: start + pcm.length / pcmRate, port: 0, register: 0x90, value: 0x20});
await transport.scheduleWrites(entries); // ACK: the whole stream is queued before start.
await transport.start();
console.log('12,000 PCM bytes; 12 kHz input; timed writes on the audio thread');
// This one musical-boundary wait only controls when resources may be released.
await sleep(Math.max(0, start + pcm.length / pcmRate + 0.1 - context.currentTime));
ws.allNotesOff();`;

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

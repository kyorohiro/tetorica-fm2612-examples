import {createSoundChip} from 'tetorica-fm2612';
import {YM2413Synth, YM2413WorkletTransport, YM2413_INSTRUMENTS, YM2413_USER_PRESETS} from 'tetorica-fm2612/ym2413synth.js';
import {SegaPSGSynth} from 'tetorica-fm2612/segapsgsynth.js';
import {SegaPSGWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Only the program below is editable. Play creates fresh audio resources.
editor.value = `opll.initialize();
psg.reset();
psg.allNotesOff();
console.log('Built-in ROM voices on CH0; A4 = MIDI 69 = 440 Hz');
for (const instrument of [1, 3, 4, 8]) {
  console.log(instrument, OPLL_INSTRUMENTS[instrument]);
  opll.setVoice(0, {instrument, attenuation: 6});
  psg.tone(0, {note: 'A2', attenuation: 13});
  opll.noteOn(0, 69);
  await sleep(0.32);
  opll.noteOff(0);
  psg.off(0);
  await sleep(0.08);
}

// There is one user patch for the entire chip, not one patch per channel.
opll.setUserPatch(OPLL_USER_PRESETS.sine);
opll.setVoice(0, {instrument: 0, attenuation: 7});
opll.setVoice(1, {instrument: 0, attenuation: 9});
opll.setVoice(2, {instrument: 4, attenuation: 11});
opll.noteOn(0, 'A4');
opll.noteOn(1, 'E5');
opll.noteOn(2, 'A3'); // Built-in Flute: unaffected by shared user-patch edits.
console.log('Shared sine: CH0 and CH1 use instrument 0; CH2 keeps its ROM Flute');
await sleep(0.65);
console.log('Change the one shared patch to bell while CH0 and CH1 are held');
opll.setUserPatch(OPLL_USER_PRESETS.bell);
await sleep(0.85);
opll.allNotesOff();
psg.allNotesOff();
await sleep(0.4);`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// Audio advances in AudioWorklet. This timer changes notes, not PCM samples.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep(seconds) expects 0..3600');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {signal.removeEventListener('abort', abort); resolve();}, seconds * 1000);
    function abort() {clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

async function addDevice(run, name, Transport, gain) {
  const device = await createSoundChip(name, {execution: 'worklet', audioContext: run.context, signal: run.controller.signal, gain});
  const resource = {device, transport: null};
  run.resources.push(resource); // Track even a late factory result before checking Stop.
  run.controller.signal.throwIfAborted();
  resource.transport = new Transport(device);
  await resource.transport.start();
  run.controller.signal.throwIfAborted();
  return resource;
}

// Stop/finally may both call this. Every endpoint is released even if one fails.
async function closeAudio(run) {
  try {
    const results = await Promise.allSettled(run.resources.map(({transport, device}) => transport ? transport.close() : device.dispose()));
    const failed = results.find(result => result.status === 'rejected');
    if (failed) throw failed.reason;
  } finally {
    if (!run.contextClosing && run.context && run.context.state !== 'closed') run.contextClosing = run.context.close();
    await run.contextClosing;
  }
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), context: null, contextClosing: null, resources: [], messages: []};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Syntax errors create no AudioContext or Worklet.
    const execute = new AsyncFunction('opll', 'OPLL_INSTRUMENTS', 'OPLL_USER_PRESETS', 'psg', 'sleep', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    await run.context.resume();
    signal.throwIfAborted();
    const opllResource = await addDevice(run, 'ym2413', YM2413WorkletTransport, 0.5);
    const opll = new YM2413Synth({transport: opllResource.transport});
    const psgResource = await addDevice(run, 'segapsg', SegaPSGWorkletTransport, 0.08);
    const psg = new SegaPSGSynth({transport: psgResource.transport});
    status.textContent = 'Playing…';
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(opll, YM2413_INSTRUMENTS, YM2413_USER_PRESETS, psg, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    opll.allNotesOff(); psg.allNotesOff();
    await Promise.all(run.resources.map(({transport}) => transport.flush()));
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, [result]);
  } finally {
    try {await closeAudio(run);}
    catch (error) {if (!signal.aborted) {result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, [result]);}}
    if (activeRun === run) {
      activeRun = null;
      playButton.disabled = false; stopButton.disabled = true;
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

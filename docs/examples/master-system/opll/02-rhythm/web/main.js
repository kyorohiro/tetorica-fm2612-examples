import {createSoundChip} from 'tetorica-fm2612';
import {YM2413Synth, YM2413WorkletTransport, YM2413_INSTRUMENTS, YM2413_USER_PRESETS} from 'tetorica-fm2612/ym2413synth.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Only the program below is editable. Play creates fresh audio resources.
editor.value = `opll.initialize();
console.log('Melody mode: all nine channels, including physical CH8');
opll.setVoice(8, {instrument: 12, attenuation: 6});
opll.noteOn(8, 'A4');
await sleep(0.35);
opll.noteOff(8);
await sleep(0.12);

// Rhythm borrows CH6..8. CH0..5 remain available for melody.
// CH6: bass drum; CH7: hi-hat + snare; CH8: tom + cymbal.
opll.setNote(6, 'C3');
opll.setNote(7, 'G3');
opll.setNote(8, 'D3');
opll.setRhythmLevels({bassDrum: 5, snare: 5, tom: 6, cymbal: 8, hiHat: 8});
opll.setRhythm({enabled: true});
for (const [name, physical] of [['bassDrum', 6], ['snare', 7], ['tom', 8], ['cymbal', 8], ['hiHat', 7]]) {
  console.log(name, 'physical channel', physical);
  opll.setRhythm({[name]: true});
  await sleep(0.045);
  opll.setRhythm({[name]: false});
  await sleep(0.255);
}

opll.setVoice(0, {instrument: 4, attenuation: 7});
const pattern = [
  ['bassDrum', 'hiHat'], ['hiHat'], ['snare', 'hiHat'], ['hiHat'],
  ['bassDrum', 'hiHat'], ['tom'], ['snare', 'cymbal'], ['hiHat'],
];
console.log('Six melody channels + five drums: CH0 melody over a short pattern');
for (let step = 0; step < pattern.length; step++) {
  const drums = pattern[step];
  opll.noteOn(0, ['A4', 'C5', 'E5', 'C5'][step % 4]);
  opll.setRhythm(Object.fromEntries(drums.map(name => [name, true])));
  await sleep(0.045);
  opll.setRhythm(Object.fromEntries(drums.map(name => [name, false])));
  await sleep(0.075);
  opll.noteOff(0);
  await sleep(0.1);
}

opll.allNotesOff();
opll.setRhythm({enabled: false});
// Drum levels share CH6..8 instrument registers: explicitly restore the voice.
opll.setVoice(8, {instrument: 12, attenuation: 6});
console.log('Back to nine melody channels: restore CH8 Vibraphone explicitly');
opll.noteOn(8, 'A4');
await sleep(0.4);
opll.noteOff(8);
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
    const execute = new AsyncFunction('opll', 'OPLL_INSTRUMENTS', 'OPLL_USER_PRESETS', 'sleep', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    await run.context.resume();
    signal.throwIfAborted();
    const opllResource = await addDevice(run, 'ym2413', YM2413WorkletTransport, 0.5);
    const opll = new YM2413Synth({transport: opllResource.transport});
    status.textContent = 'Playing…';
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(opll, YM2413_INSTRUMENTS, YM2413_USER_PRESETS, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    opll.allNotesOff();
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

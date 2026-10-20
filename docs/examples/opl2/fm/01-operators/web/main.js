import {createSoundChip} from 'tetorica-fm2612';
import {OPLSynth, OPL_PRESETS} from 'tetorica-fm2612/opl_synth.js';
import {OPLWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Only this program is editable. Each Play gets a fresh Synth and audio device.
editor.value = `opl.initialize();
// The same two operators, with their connection changed: FM or additive.
for (const algorithm of [0, 1]) {
  console.log(algorithm === 0 ? 'FM: modulator → carrier' : 'Additive: modulator + carrier');
  opl.setPreset(0, OPL_PRESETS.organ);
  opl.setOperator(0, 0, {multi: 2, tl: 24});
  opl.setOperator(0, 1, {multi: 1, tl: 20});
  opl.setAlgo(0, algorithm, 0);
  opl.noteOn(0, 'A3');
  await sleep(0.55);
  opl.noteOff(0);
  await sleep(0.1);
}

// OPL2 waveform codes: sine, half-sine, absolute-sine and quarter-sine.
for (const waveform of [0, 1, 2, 3]) {
  console.log('Carrier waveform', waveform);
  opl.setPreset(0, OPL_PRESETS.sine);
  opl.setOperator(0, 1, {waveform, tl: 18});
  opl.noteOn(0, 'A4');
  await sleep(0.45);
  opl.noteOff(0);
  await sleep(0.08);
}

console.log('Deep hardware AM + vibrato: fixed-rate LFO');
opl.setPreset(0, OPL_PRESETS.organ);
opl.setOperator(0, 1, {am: true, vibrato: true});
opl.setLFO({amDepth: true, pmDepth: true});
opl.noteOn(0, 'A4');
await sleep(0.9);
opl.allNotesOff();
await sleep(0.3);`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// The audio clock lives in AudioWorklet; this timer only changes musical notes.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep(seconds) expects 0..3600');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {signal.removeEventListener('abort', abort); resolve();}, seconds * 1000);
    function abort() {clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

// May be called by Stop and again by finally. A late factory result is also
// disposed, while a supplied AudioContext remains our responsibility to close.
async function closeAudio(run) {
  try {
    if (run.transport) await run.transport.close();
    else await run.device?.dispose();
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
  const source = editor.value, kind = 'ym3812';
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Compile first: invalid code does not create any audio resources.
    const execute = new AsyncFunction('opl', 'OPL_PRESETS', 'sleep', 'console', `'use strict';\n${source}`);
    run.context = new AudioContext();
    await run.context.resume();
    signal.throwIfAborted();
    run.device = await createSoundChip(kind, {execution: 'worklet', audioContext: run.context, signal, gain: 0.3});
    signal.throwIfAborted();
    run.transport = new OPLWorkletTransport(run.device);
    const opl = new OPLSynth({chip: kind, transport: run.transport});
    await run.transport.start();
    signal.throwIfAborted();
    status.textContent = 'Playing…';
    report(run, [kind, 'OPLSynth → OPLWorkletTransport → AudioWorklet']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(opl, OPL_PRESETS, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    opl.allNotesOff();
    await run.transport.flush();
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

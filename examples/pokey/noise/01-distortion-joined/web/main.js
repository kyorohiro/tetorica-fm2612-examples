import {createSoundChip} from 'tetorica-fm2612';
import {PokeySynth} from 'tetorica-fm2612/pokeysynth.js';
import {PokeyWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

const CLOCK = 1789790; // Input clock, not the output sample rate.
const OUTPUT_GAIN = 0.25; // Applied once by each Worklet endpoint, never normalized.
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// This source is editable. Each Play gets fresh cores and a new audio context.
editor.value = `const {pokey, transport} = await startAudio();
pokey.initialize(); // Silent defaults; CH0..3 are physical channels.
pokey.setVolume(0, 7);
await transport.start();
// AUDCTL (including poly9) is shared: stop all voices before changing it.
const colors = [
  {distortion: 5, poly9: false, label: 'pure square (5)'},
  {distortion: 2, poly9: false, label: 'poly5 + poly4 (2)'},
  {distortion: 0, poly9: false, label: 'poly5 + poly17 (0)'},
  {distortion: 0, poly9: true, label: 'poly5 + poly9 (0)'},
];
for (const color of colors) {
  pokey.allNotesOff();
  pokey.setPoly9(color.poly9);
  pokey.setDistortion(0, color.distortion);
  pokey.noteOn(0, 'B4'); // Same timer target; B4 avoids a poly9 timer alias, unlike A4.
  console.log(color.label);
  await sleep(0.45);
  pokey.allNotesOff();
  await sleep(0.1);
}
pokey.allNotesOff();
pokey.setPoly9(false);
pokey.setHighClock(0, true);
pokey.setJoined(0, true); // Pair (CH0, CH1): lower CH0 becomes a timer helper.
pokey.setDistortion(1, 5);
pokey.setVolume(1, 7);
console.log('16-bit joined pair with high clock: tune/key upper CH1 only');
for (const note of ['C2', 'G2', 'C3', 'E3']) {
  pokey.noteOn(1, note); // Never noteOn() or setFrequency() on joined lower CH0.
  await sleep(0.35);
  pokey.allNotesOff();
  await sleep(0.1);
}
await sleep(0.1);`;

function report(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

// JS timers place musical edges; the actual core and PCM run in AudioWorklet.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep(seconds) expects 0..3600');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {signal.removeEventListener('abort', abort); resolve();}, seconds * 1000);
    function abort() {clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

function closeAudio(run) {
  if (run.cleanup) return run.cleanup;
  run.closing = true;
  run.cleanup = (async () => {
    // An interrupted factory may still be settling. Include any late-created
    // endpoint in this cleanup, and do not allow a second startAudio() call.
    try {await run.initializing;} catch { /* The Play handler reports initialization errors. */ }
    try {
      for (const [i, transport] of run.transports.entries()) {
        if (!transport.disposed) {
          run.synths[i].allNotesOff();
          try {await transport.clearScheduledWrites();} catch { /* Endpoint may already be closing. */ }
          await transport.close();
        }
      }
    } finally {
      try {await Promise.all(run.devices.map(device => device.dispose()));}
      finally {if (run.context && run.context.state !== 'closed') await run.context.close();}
    }
  })();
  return run.cleanup;
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), context: null, devices: [], transports: [], synths: [], initializing: null, started: false, closing: false, cleanup: null, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Invalid edited code creates no audio resources. AudioContext is lazy: Play only.
    const execute = new AsyncFunction('startAudio', 'sleep', 'console', `'use strict';\n${editor.value}`);
    run.context = new AudioContext();
    await run.context.resume(); // Resume from the user's Play gesture.
    signal.throwIfAborted();
    function startAudio() {
      signal.throwIfAborted();
      if (run.started || run.closing) throw new Error('Call startAudio() once per Play');
      run.started = true;
      run.initializing = (async () => {
        const device = await createSoundChip('pokey', {execution: 'worklet', audioContext: run.context, signal, clock: CLOCK, gain: OUTPUT_GAIN});
        run.devices.push(device);
        signal.throwIfAborted();
        const transport = new PokeyWorkletTransport(device);
        run.transports.push(transport);
        const pokey = new PokeySynth({transport, clock: device.clock});
        run.synths.push(pokey);
        signal.throwIfAborted();
        status.textContent = 'Playing…';
        report(run, ['POKEY noise / joined', CLOCK + ' Hz clock', run.devices[0].sampleRate() + ' Hz PCM', 'AudioWorklet', 'mono', 'output gain ' + OUTPUT_GAIN]);
        return {pokey, transport, context: run.context};
      })();
      return run.initializing;
    }
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(startAudio, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    await Promise.all(run.transports.map(transport => transport.flush()));
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

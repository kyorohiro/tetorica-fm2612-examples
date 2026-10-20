import {createSoundChip} from 'tetorica-fm2612';
import {AY8910Synth, AY8910WorkletTransport, AY8910_CLOCK} from 'tetorica-fm2612/ay8910synth.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// Only this program is editable. Each Play gets a fresh Synth and audio device.
editor.value = `ay.initialize(); // Silent defaults; constructing a Synth never resets a borrowed chip.
console.log('A4 = MIDI 69 = 440 Hz; physical channels are 0..2');
ay.tone(0, {note: 'A4', volume: 9}); // 0=silent, 15=loudest.
await sleep(0.6);
ay.keyOff(0);
await sleep(0.1);

console.log('Three tone voices: C4 / E4 / G4');
for (const [channel, note] of [[0, 'C4'], [1, 'E4'], [2, 'G4']]) {
  ay.tone(channel, {note, volume: 7});
}
await sleep(0.65);
ay.allNotesOff();
await sleep(0.1);

console.log('Two voices share the SAME noise generator');
ay.noise(0, {period: 6, volume: 8});
ay.noise(1, {period: 6, volume: 6});
await sleep(0.5);
ay.setNoisePeriod(22); // Changes BOTH noise-enabled voices.
await sleep(0.5);

console.log('Tone and noise together on CH0');
ay.keyOff(1);
ay.setVoice(0, {tone: true, noise: true, note: 'A3', volume: 9, envelope: false});
await sleep(0.65);
ay.allNotesOff();
await sleep(0.2);`;

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
  const source = editor.value;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Compile first: invalid code does not create any audio resources.
    const execute = new AsyncFunction('ay', 'sleep', 'console', `'use strict';\n${source}`);
    run.context = new AudioContext();
    await run.context.resume();
    signal.throwIfAborted();
    run.device = await createSoundChip('ay8910', {execution: 'worklet', audioContext: run.context, signal, clock: AY8910_CLOCK, gain: 0.35});
    signal.throwIfAborted();
    run.transport = new AY8910WorkletTransport(run.device);
    const ay = new AY8910Synth({transport: run.transport, clock: AY8910_CLOCK});
    await run.transport.start();
    signal.throwIfAborted();
    status.textContent = 'Playing…';
    report(run, ['AY-3-8910', AY8910_CLOCK + ' Hz input clock', run.device.sampleRate() + ' Hz PCM', 'AudioWorklet']);
    const output = Object.fromEntries(['log', 'warn', 'error'].map(method => [method, (...values) => {console[method](...values); report(run, values);} ]));
    await execute(ay, seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
    ay.allNotesOff();
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

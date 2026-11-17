import {createAy8910Audio} from 'tetorica-fm2612/playground_ay8910_audio.js';
import {createAy8910Client} from 'tetorica-fm2612/playground_ay8910.js';

const $ = id => document.getElementById(id);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const profile = {clock: 2000000, type: 0x10, flags: 1}; // YM2149, ST input clock.
let activeRun = null;

// This is the editable program. b.atSample()/atSeconds() describe offsets,
// while beat() follows setBpm(). No JavaScript timer sends individual R13 writes.
$('code').value = `setBpm(120);
ym.reset();
ym.keyOff(1); ym.keyOff(2);
ym.setVoice(0, {tone: true, noise: false, volume: 9, envelope: true});
ym.setEnvelope({period: 100, shape: 8});

// Software repeats the SAME R13 byte; each write restarts the hardware envelope.
const retriggerHz = 110;
const retrigger = ym.build(b => {
  b.atSample(0).setEnvelope({shape: 8});
});
console.table(await ym.compile(retrigger, {initialState: "client"}));
const receipt = await ym.schedule(retrigger, {
  name: "sync-buzzer", repeatSeconds: 1 / retriggerHz,
});
console.log("SYNC_BUZZER_RUNNING", retriggerHz + " R13 writes/s", receipt);

// The note loop has a separate rhythm. BPM changes these note lengths,
// not the retrigger frequency expressed in Hz. Physical CH1 is numbered 0.
const notes = ["E3", "G3", "A3", "B3", "D4", "B3", "A3", "G3"];
for (let i = 0; i < 16; i++) {
  ym.noteOn(0, notes[i % notes.length]);
  await beat(0.4);
  ym.noteOff(0);
  await beat(0.1);
}
await ym.clearSchedule("sync-buzzer");
ym.keyOff(0);
console.log("SYNC_BUZZER_CLEARED");`;

function format(value) {
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
}
function log(run, values) {
  if (activeRun !== run) return;
  run.messages.push(values.map(format).join(' ').slice(0, 1500));
  $('detail').textContent = run.messages.slice(-16).join('\n');
}
function showWrites(rows) {
  if (!Array.isArray(rows)) throw new TypeError('console.table expects compiled write rows');
  $('writeRows').replaceChildren(...rows.slice(0, 64).map(row => {
    const tr = document.createElement('tr');
    for (const value of [row.offsetSeconds, 'R' + row.register, '0x' + row.value.toString(16).padStart(2, '0')]) {
      const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
    }
    return tr;
  }));
  $('writeCount').textContent = `${rows.length} predicted write(s). Showing up to 64.`;
}

// This timer advances the musical phrase only. Timed chip writes stay on the
// Worklet sample clock. Stop rejects pending waits rather than leaving a note loop.
function sleep(seconds, signal) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 3600) throw new RangeError('sleep expects 0..3600 seconds');
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const done = () => { signal.removeEventListener('abort', abort); resolve(); };
    const timer = setTimeout(done, seconds * 1000);
    function abort() { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason); }
    signal.addEventListener('abort', abort, {once: true});
  });
}
async function closeAudio(run) {
  if (run.closing) return run.closing;
  run.closing = (async () => {
    try {
      run.gain?.disconnect(); // Silence immediately, including a failed Worklet.
      // Send cancellation before Off/dispose. Do not wait for an unavailable
      // processor's ACK: client disposal rejects any unfinished request.
      if (run.ym && run.context?.state !== 'closed') {
        try { void run.ym.clearSchedule('sync-buzzer').catch(() => {}); } catch {}
        try { run.ym.allNotesOff(); } catch {}
      }
    } finally {
      try { run.ym?.dispose(); } finally {
        try { run.endpoint?.dispose(); } finally {
          if (run.context && run.context.state !== 'closed') await run.context.close();
        }
      }
    }
  })();
  return run.closing;
}

$('play').addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), messages: [], context: null, endpoint: null, ym: null, gain: null, closing: null, failure: null};
  const {signal} = run.controller;
  activeRun = run; $('play').disabled = true; $('stop').disabled = false;
  $('status').textContent = 'Loading…'; $('detail').textContent = '';
  $('writeRows').replaceChildren(); $('writeCount').textContent = 'No compiled trace yet.';
  let result = 'Finished.';
  try {
    // Syntax errors do not open an audio device.
    const execute = new AsyncFunction('ym', 'setBpm', 'beat', 'sleep', 'console', `'use strict';\n${$('code').value}`);
    run.context = new AudioContext(); await run.context.resume(); signal.throwIfAborted();
    run.gain = run.context.createGain(); run.gain.gain.value = 0.2; run.gain.connect(run.context.destination);
    run.endpoint = await createAy8910Audio(run.context, run.gain, {...profile, signal, onError(error) {
      run.failure = error ?? new Error('YM2149 audio processor failed'); run.controller.abort(run.failure);
    }});
    // A Stop during initialization may have already closed the host context.
    if (signal.aborted) { run.endpoint.dispose(); signal.throwIfAborted(); }
    run.ym = createAy8910Client(run.endpoint.port, {...profile, instanceId: run.endpoint.instanceId});
    let bpm = 120;
    const setBpm = value => {
      if (!Number.isFinite(value) || value <= 0 || value > 1000) throw new RangeError('BPM must be 0..1000, excluding 0');
      bpm = value;
    };
    const output = {log: (...values) => { console.log(...values); log(run, values); },
      warn: (...values) => { console.warn(...values); log(run, values); },
      error: (...values) => { console.error(...values); log(run, values); },
      table: rows => {
        console.table(rows);
        if (Array.isArray(rows) && rows.every(row => Number.isInteger(row?.register) && Number.isInteger(row?.value))) showWrites(rows);
        else log(run, [rows]);
      }};
    $('status').textContent = 'Playing…';
    log(run, ['YM2149', profile.clock + ' Hz', 'Software-timed R13 writes / hardware envelope']);
    await execute(run.ym, setBpm, beats => sleep(beats * 60 / bpm, signal), seconds => sleep(seconds, signal), output);
    signal.throwIfAborted();
  } catch (error) {
    result = signal.aborted && !run.failure ? 'Stopped.' : `Error: ${(run.failure ?? error)?.message ?? String(error)}`;
    if (!signal.aborted || run.failure) log(run, [result]);
  } finally {
    try { await closeAudio(run); } catch (error) { result = `Cleanup error: ${error.message}`; }
    if (activeRun === run) {
      activeRun = null; $('play').disabled = false; $('stop').disabled = true;
      $('status').textContent = run.failure ? result : signal.aborted ? 'Stopped.' : result;
    }
  }
});
function stop() {
  const run = activeRun;
  if (!run || run.controller.signal.aborted) return;
  run.controller.abort(new DOMException('Stopped', 'AbortError'));
  $('stop').disabled = true; $('status').textContent = 'Stopping…';
  void closeAudio(run).catch(error => log(run, [`Stop cleanup: ${error.message}`]));
}
$('stop').addEventListener('click', stop);
window.addEventListener('pagehide', stop);

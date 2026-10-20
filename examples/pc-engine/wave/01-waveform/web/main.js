import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let activeRun = null;

// pce / beat / console below belong to the loaded Playground script.
editor.value = `setBpm(120);
pce.initialize();
const waveforms = [
  ['Sine · left', Array.from({length: 32}, (_, i) => Math.round(15.5 + 15.5 * Math.sin(i * Math.PI / 16))), 15, 0],
  ['Triangle · center', Array.from({length: 32}, (_, i) => i < 16 ? i * 2 : 63 - i * 2), 15, 15],
  ['Sawtooth · right', Array.from({length: 32}, (_, i) => i), 0, 15],
];
pce.setVolume(0, 26); // Hardware level 0..31; higher is louder.
for (const [name, waveform, left, right] of waveforms) {
  console.log(name);
  pce.setWaveform(0, waveform); // Uploading a waveform stops this channel.
  pce.setPan(0, left, right); // Independent balances 0..15, not normalized pan.
  for (const note of ['C4', 'E4', 'G4', 'C5']) {
    pce.noteOn(0, note); // Keep running between notes to avoid hard key cuts.
    await beat(0.5);
  }
}
pce.allNotesOff();
await beat(2); // Let the final scheduled stop reach Worker audio before cleanup.`;

function report(run, message) {
  if (activeRun !== run) return;
  run.messages.push(String(message).slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), runtime: null, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  const source = editor.value; // Edits take effect on the next Play.
  const execution = executionSelect.value;
  let result = 'Finished.';
  playButton.disabled = true;
  stopButton.disabled = false;
  executionSelect.disabled = true;
  status.textContent = 'Loading…';
  report(run, `PC Engine HuC6280 · ${execution === 'worker' ? 'Worker' : 'Main'} execution`);
  try {
    // The primary instrument is HuC6280; no Genesis / YM2612 is created.
    const pg = Playground({
      chip: 'huc6280',
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus(message) { report(run, message); },
      onLog(line) { report(run, line); },
    });
    run.runtime = pg;
    await pg.initialize();
    signal.throwIfAborted(); // Stop may have arrived while WASM was loading.
    pg.setMasterVolume(0.5);
    pg.load('pc-engine-wave-01-waveform', source);
    status.textContent = 'Playing…';
    await pg.play('pc-engine-wave-01-waveform', {execution});
    signal.throwIfAborted();
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, result);
  } finally {
    try {
      // Initialization must settle before late-created audio can be closed.
      await run.runtime?.finalize();
    } catch (error) {
      result = `Cleanup error: ${error?.message ?? String(error)}`;
      report(run, result);
    } finally {
      run.runtime = null;
      if (activeRun === run) {
        activeRun = null;
        playButton.disabled = false;
        stopButton.disabled = true;
        executionSelect.disabled = false;
        status.textContent = result;
      }
    }
  }
});

function stop() {
  const run = activeRun;
  if (!run || run.controller.signal.aborted) return;
  run.controller.abort();
  stopButton.disabled = true;
  status.textContent = 'Stopping…';
  try { run.runtime?.stop(); }
  catch (error) { report(run, `Stop error: ${error?.message ?? String(error)}`); }
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

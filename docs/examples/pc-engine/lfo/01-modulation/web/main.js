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
pce.setWaveform(0, Array.from({length: 32}, (_, i) =>
  Math.round(15.5 + 15.5 * Math.sin(i * Math.PI / 16))));
pce.setWaveform(1, Array.from({length: 32}, (_, i) => i < 16 ? i * 2 : 63 - i * 2));
pce.setVolume(0, 26);
pce.setPan(0, 15, 15);
pce.setVolume(1, 0); // CH1 supplies modulation; its sound need not be audible.
pce.setNote(1, 'C3');

for (const depth of [0, 1]) {
  console.log('LFO depth ' + depth);
  // CH1 period and this multiplier determine LFO speed; neither is Hz.
  pce.setLfo({frequency: 24, depth});
  for (const note of ['A4', 'C5', 'A4']) {
    pce.noteOn(0, note);
    await beat(0.75);
  }
}
pce.allNotesOff();
pce.setLfo({frequency: 24, depth: 0});
await beat(2); // Drain Worker lookahead before closing audio.`;

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
    pg.load('pc-engine-lfo-01-modulation', source);
    status.textContent = 'Playing…';
    await pg.play('pc-engine-lfo-01-modulation', {execution});
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

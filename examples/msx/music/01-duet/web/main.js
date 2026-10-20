import {createPlaygroundRuntime} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let activeRun = null;

// ay / opll / beat / console belong to the loaded Playground script.
editor.value = `setBpm(120);
// The runtime owns exactly AY + YM2413. useSoundChip() borrows these same chips.
console.log('PSG bass + MSX-MUSIC Piano');
ay.setVoice(0, {tone: true, noise: false, volume: 8, envelope: false});
opll.setVoice(0, {instrument: 3, attenuation: 6, sustain: false});
const lead = ['C4', 'E4', 'G4', 'B4', 'C5', 'G4', 'E4', 'D4'];
for (let step = 0; step < lead.length; step++) {
  ay.noteOn(0, step < 4 ? 'C3' : 'G2');
  opll.noteOn(0, lead[step]);
  await beat(0.7);
  ay.keyOff(0);
  opll.keyOff(0);
  await beat(0.3);
}
ay.allNotesOff();
opll.allNotesOff();
await beat(2); // Release tail and Worker lookahead before closing audio.`;

function report(run, message) {
  if (activeRun !== run) return;
  run.messages.push(String(message).slice(0, 500));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}

playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller: new AbortController(), runtime: null, initializing: false, initializationClosing: null, messages: []};
  activeRun = run;
  const {signal} = run.controller;
  const source = editor.value, execution = executionSelect.value;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false; executionSelect.disabled = true;
  status.textContent = 'Loading…'; detail.textContent = '';
  try {
    // Check syntax before opening audio; the runtime supplies the script globals.
    new AsyncFunction(source);
    const pg = createPlaygroundRuntime({
      chip: 'msx',
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus(message) { report(run, message); },
      onLog(line) { console.log(line); report(run, line); },
    });
    run.runtime = pg; run.initializing = true;
    report(run, `MSX · ${execution === 'worker' ? 'Worker' : 'Main'} execution`);
    // One runtime creates all primary chips; the program does not recreate them.
    await pg.initialize();
    run.initializing = false;
    signal.throwIfAborted();
    pg.setMasterVolume(0.6);
    pg.load('msx-music-01-duet', source);
    status.textContent = 'Playing…';
    await pg.play('msx-music-01-duet', {execution});
    signal.throwIfAborted();
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${error?.message ?? String(error)}`;
    if (!signal.aborted) report(run, result);
  } finally {
    run.initializing = false;
    try {
      // Stop can abort an initializing native runtime. Finish its close first,
      // then finalize the execution host, including any Worker created later.
      await run.initializationClosing?.catch(() => {});
      await run.runtime?.finalize();
    } catch (error) {
      if (!signal.aborted) { result = `Cleanup error: ${error?.message ?? String(error)}`; report(run, result); }
    }
    if (activeRun === run) {
      activeRun = null;
      playButton.disabled = false; stopButton.disabled = true; executionSelect.disabled = false;
      status.textContent = signal.aborted ? 'Stopped.' : result;
    }
  }
});

function stop() {
  const run = activeRun;
  if (!run || run.controller.signal.aborted) return;
  run.controller.abort(new DOMException('Stopped', 'AbortError'));
  stopButton.disabled = true; status.textContent = 'Stopping…';
  try { run.runtime?.stop(); }
  catch (error) { report(run, `Stop error: ${error?.message ?? String(error)}`); }
  if (run.initializing) {
    // close() aborts the native runtime's pending fetch/Worklet initialization.
    run.initializationClosing = run.runtime.megaDrive.close();
    run.initializationClosing.catch(error => report(run, `Initialization cleanup: ${error?.message ?? String(error)}`));
  }
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

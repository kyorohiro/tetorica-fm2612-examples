import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let activeRun = null;

// These names are Playground globals inside the script, not page globals.
editor.value = `setBpm(120);
const snes = await useSoundChip('snes');
const brr = new Uint8Array([0xc3, 0x13, 0x57, 0x75, 0x31, 0xfd, 0xb9, 0x9b, 0xdf]);
// Original 16-sample loop: 32,000 / 16 = 2,000 Hz at PITCH 4096.
// BRR does not encode a root note. Declare its tuning and loop explicitly.
const sample = await snes.loadBRR(brr, {
  baseFrequencyHz: 2000,
  loopStartSamples: 0,
});
for (const channel of [0, 1, 2]) {
  snes.setPreset(channel, {
    sample,
    adsr1: 0x8f, adsr2: 0xe0, gain: 127,
    volumeLeft: 90, volumeRight: 90,
  });
}
await mixer.set(snes.id, {volume: 0.5});

for (const note of ['C4', 'E4', 'G4', 'C5']) {
  snes.noteOn(0, note); // Fixed physical voice 0, not automatic allocation.
  await beat(0.75);
  snes.noteOff(0);
  await beat(0.25);
}
['C4', 'E4', 'G4'].forEach((note, channel) => snes.noteOn(channel, note));
await beat(2);
snes.allNotesOff();
await beat(2); // Release window before the host closes audio.`;

const errorMessage = error => error?.message ?? String(error);

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
  const execution = executionSelect.value;
  const source = editor.value;
  let result = 'Finished.';
  playButton.disabled = true;
  stopButton.disabled = false;
  executionSelect.disabled = true;
  status.textContent = 'Loading…';
  report(run, `Experimental SNES S-DSP · ${execution === 'worker' ? 'Worker' : 'Main'} execution`);

  try {
    const pg = Playground({
      audioWorkletUrl: runtimeAssetUrl('ym2612-worklet.js').href,
      ym2612WasmUrl: runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
      segaPsgWasmUrl: runtimeAssetUrl('generated/segapsg_wasm.wasm').href,
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus(message) { report(run, message); },
      onLog(line) { report(run, line); },
    });
    run.runtime = pg;
    await pg.initialize();
    // Stop can arrive while initialization is still creating audio resources.
    signal.throwIfAborted();
    pg.setMasterVolume(0.5);
    pg.load('snes-brr-notes', source);
    status.textContent = 'Playing…';
    await pg.play('snes-brr-notes', {execution});
    signal.throwIfAborted();
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${errorMessage(error)}`;
    if (!signal.aborted) report(run, result);
  } finally {
    try {
      // Wait for initialization/play to settle before closing late-created nodes.
      await run.runtime?.finalize();
    } catch (error) {
      result = `Cleanup error: ${errorMessage(error)}`;
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
  catch (error) { report(run, `Stop error: ${errorMessage(error)}`); }
}

stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

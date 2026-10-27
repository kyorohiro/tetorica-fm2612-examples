import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let activeRun = null;

// pce / adpcm / cdda / sleep belong to this loaded Playground script.
editor.value = `// Generate a short original mono tone; loadSample also accepts PCM/float WAV bytes.
pce.initialize(); // No PSG note is played in this ADPCM-only example.
const sampleRate = 8000, frames = 4800, mono = new Float32Array(frames);
for (let i = 0; i < frames; i++) {
  const t = i / sampleRate;
  const fade = Math.min(1, t / 0.025, (frames - 1 - i) / sampleRate / 0.025);
  mono[i] = Math.sin(2 * Math.PI * 220 * t) * 0.20 * fade;
}
const prepared = await adpcm.loadSample({sampleRate, channels: [mono]}, {rate: 12});
console.log('Encoded sample:', prepared); // At most 64 KiB, high nibble first.
await adpcm.play(); // Rate12 = 8 kHz with the default 1,536,000 Hz clock.
console.log('PHASE_ADPCM_PLAY', await adpcm.getState());
await sleep(0.65); // The sample lasts 0.6 seconds; the remainder is EOF silence.
console.log('PHASE_ADPCM_EOF', await adpcm.getState());
await sleep(0.15);
// Offsets and lengths count NIBBLES, not bytes, seconds or output frames.
// Keep the fade-in/out while demonstrating an odd nibble start and a bounded range.
await adpcm.play({offset: 1, length: frames - 2, rate: 12, loop: true});
console.log('PHASE_ADPCM_LOOP', await adpcm.getState());
await sleep(0.8);
await adpcm.stop(); // Retain prepared RAM for replay.
console.log('PHASE_ADPCM_STOP', await adpcm.getState());
await sleep(0.2);
await adpcm.play();
console.log('PHASE_ADPCM_REPLAY', await adpcm.getState());
await sleep(0.65);
console.log('PHASE_ADPCM_EOF', await adpcm.getState());
await sleep(0.15);
await adpcm.stop();`;

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
  report(run, `PC Engine CD-ROM² · ${execution === 'worker' ? 'Worker' : 'Main'} execution`);
  try {
    // PSG stays silent unless the edited script plays it. CD-DA / ADPCM share its audio output clock.
    const pg = Playground({
      chip: 'huc6280', pcEngineCd: true,
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus(message) { report(run, message); },
      onLog(line) { report(run, line); },
    });
    run.runtime = pg;
    await pg.initialize();
    signal.throwIfAborted(); // Stop may have arrived while WASM was loading.
    pg.setMasterVolume(0.5);
    pg.load('pc-engine-cd-adpcm-01-sample', source);
    status.textContent = 'Playing…';
    await pg.play('pc-engine-cd-adpcm-01-sample', {execution});
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

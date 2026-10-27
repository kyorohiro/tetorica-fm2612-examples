import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612/wav.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let activeRun = null;

// Generate the complete demo WAV before playback; never request PCM from the UI per block.
// Each track gets its own 25 ms fade. No external disc or sample data is used.
function makeDemoWav() {
  const sampleRate = 44100, seconds = 2.4, frames = Math.round(sampleRate * seconds);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    const track = Math.floor(i / 52920);
    const localFrame = i % 52920;
    const trackFrames = 52920;
    const t = localFrame / sampleRate;
    const fade = Math.min(1, t / 0.025, (trackFrames - 1 - localFrame) / sampleRate / 0.025);
    left[i] = Math.sin(2 * Math.PI * (track ? 440 : 220) * t) * 0.16 * fade;
    right[i] = Math.sin(2 * Math.PI * (track ? 660 : 330) * t) * 0.16 * fade;
  }
  return new Uint8Array(encodeWav({left, right, sampleRate}));
}

// pce / adpcm / cdda / sleep belong to this loaded Playground script.
editor.value = `// Two original 1.2-second tracks from a generated stereo PCM16 WAV.
// The host's readCddaFile callback resolves this demo path; see the full source.
pce.initialize(); // Keep PSG silent in this CD-DA-only example.
await cdda.load({tracks: [
  {number: 2, file: '/generated/stereo.wav', title: '220 Hz left / 330 Hz right', startFrame: 0, endFrame: 52920},
  {number: 3, file: '/generated/stereo.wav', title: '440 Hz left / 660 Hz right', startFrame: 52920, endFrame: 105840},
]});
console.log('Tracks:', await cdda.list());
await cdda.play(2);
console.log('PHASE_CDDA_PLAY', await cdda.getState());
await sleep(0.6);
await cdda.pause();
console.log('PHASE_CDDA_PAUSE', await cdda.getState());
await sleep(0.2);
await cdda.resume();
console.log('PHASE_CDDA_RESUME', await cdda.getState());
await sleep(0.4);
await cdda.seek(0.2); // Seconds relative to the selected track, not the WAV.
console.log('PHASE_CDDA_SEEK', await cdda.getState());
await sleep(0.4);
await cdda.play(3);
console.log('PHASE_CDDA_TRACK3', await cdda.getState());
await sleep(1.2);
console.log('PHASE_CDDA_EOF', await cdda.getState());
await sleep(0.2);
await cdda.play(2, {offset: 0.25});
console.log('PHASE_CDDA_REPLAY', await cdda.getState());
await sleep(0.4);
await cdda.stop();
console.log('PHASE_CDDA_STOP', await cdda.getState());
await sleep(0.2);`;

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
    const demoWav = makeDemoWav();
    signal.throwIfAborted();
    // PSG stays silent unless the edited script plays it. CD-DA / ADPCM share its audio output clock.
    const pg = Playground({
      chip: 'huc6280', pcEngineCd: true,
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      readCddaFile: async path => {
        signal.throwIfAborted();
        if (path !== '/generated/stereo.wav') throw new Error('Unknown demo audio path: ' + path);
        return demoWav;
      },
      onStatus(message) { report(run, message); },
      onLog(line) { report(run, line); },
    });
    run.runtime = pg;
    await pg.initialize();
    signal.throwIfAborted(); // Stop may have arrived while WASM was loading.
    pg.setMasterVolume(0.5);
    pg.load('pc-engine-cd-cdda-01-stereo-tracks', source);
    status.textContent = 'Playing…';
    await pg.play('pc-engine-cd-cdda-01-stereo-tracks', {execution});
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

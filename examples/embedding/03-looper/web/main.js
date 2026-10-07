import {MegaSynth} from 'tetorica-fm2612/megasynth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {MegaSynthLooper} from 'tetorica-fm2612/looper.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let controller;

// Local, abortable timer: Stop also cancels waits between notes.
function wait(milliseconds, {signal}) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, milliseconds);
    function abort() { clearTimeout(timer); reject(signal.reason); }
    signal.addEventListener('abort', abort, {once: true});
  });
}
let mega;
let looper;

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Loading…';
  try {
    mega = new MegaSynth({
      workletUrl: runtimeAssetUrl('ym2612-worklet.js').href,
      ym2612WasmUrl: runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
      masterVolume: 0.25,
    });
    await mega.start();
    signal.throwIfAborted();
    mega.fm.setPreset(0, FM_PRESETS.sine);
    looper = new MegaSynthLooper({synth: mega});
    await looper.start();
    await looper.startRecording();
    status.textContent = 'Recording…';
    looper.noteOn(0, 4, 553);
    await wait(200, {signal});
    looper.noteOff(0);
    await wait(100, {signal});
    looper.noteOn(0, 4, 829);
    await wait(200, {signal});
    looper.noteOff(0);
    await wait(100, {signal});
    const unit = await looper.finishRecording();
    detail.textContent = JSON.stringify({state: looper.getState(), unit}, null, 2);
    status.textContent = 'Looping…';
    await wait(1400, {signal});
    await looper.undo();
    await looper.stop();

    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (looper) await looper.stop();
    looper = null;
    if (mega) await mega.close();
    mega = null;
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});
stopButton.addEventListener('click', () => { controller?.abort(); void mega?.close(); });
window.addEventListener('pagehide', () => { controller?.abort(); void mega?.close(); });

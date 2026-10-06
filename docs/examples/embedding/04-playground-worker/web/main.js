import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let controller;

// Local, abortable timer: Stop also cancels waits between notes.
function wait(milliseconds, signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, milliseconds);
    function abort() { clearTimeout(timer); reject(signal.reason); }
    signal.addEventListener('abort', abort, {once: true});
  });
}
let pg;
const editor = document.getElementById('code');
editor.value = `setBpm(120);
fm.setPreset(CH1, FM_PRESETS.sine);
liveLoop("lead", async () => {
  await play("C4", {channel: CH1, duration: 0.18});
  await beat(0.5);
  await play("E4", {channel: CH1, duration: 0.18});
  await beat(0.5);
  await play("G4", {channel: CH1, duration: 0.18});
  await beat(1);
});`;

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Loading…';
  try {
    pg = Playground({
      audioWorkletUrl: runtimeAssetUrl('ym2612-worklet.js').href,
      ym2612WasmUrl: runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
      segaPsgWasmUrl: runtimeAssetUrl('generated/segapsg_wasm.wasm').href,
      logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus(message) { detail.textContent = message; },
    });
    await pg.initialize();
    signal.throwIfAborted();
    pg.setMasterVolume(0.25);
    pg.load('stage1', editor.value);
    await pg.play('stage1', {execution: 'worker'});
    status.textContent = 'Playing…';
    await wait(2300, signal);
    detail.textContent = JSON.stringify(pg.getState(), null, 2);
    pg.stop();
    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (pg) await pg.finalize();
    pg = null;
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});
stopButton.addEventListener('click', () => { controller?.abort(); pg?.stop(); });
window.addEventListener('pagehide', () => { controller?.abort(); void pg?.finalize(); });

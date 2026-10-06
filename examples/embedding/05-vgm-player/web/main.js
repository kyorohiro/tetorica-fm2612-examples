import {VgmRuntime} from 'tetorica-fm2612/vgm_runtime.js';
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
let vgm;
let downloadUrl;
const pauseButton = document.getElementById('pause');
const resumeButton = document.getElementById('resume');
playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Loading…';
  try {
    const ymResponse = await fetch(runtimeAssetUrl('generated/ym2612_wasm.wasm'), {signal});
    if (!ymResponse.ok) throw new Error(`YM2612 WASM: HTTP ${ymResponse.status}`);
    const ymBytes = new Uint8Array(await ymResponse.arrayBuffer());
    const psgResponse = await fetch(runtimeAssetUrl('generated/segapsg_wasm.wasm'), {signal});
    if (!psgResponse.ok) throw new Error(`PSG WASM: HTTP ${psgResponse.status}`);
    const psgBytes = new Uint8Array(await psgResponse.arrayBuffer());
    // VgmRuntime is a separate player API; its chip loaders accept wasmBinary.
    vgm = VgmRuntime({
      ym2612ModuleOptions: {wasmBinary: ymBytes},
      segaPsgModuleOptions: {wasmBinary: psgBytes},
      audioWorkletUrl: runtimeAssetUrl('vgm-output-worklet.js').href,
      masterVolume: 0.25,
    });
    const file = document.getElementById('file').files[0];
    let input;
    if (file) {
      input = new Uint8Array(await file.arrayBuffer());
    } else {
  // A self-contained VGM 1.50: Sega PSG channel 0, about 440 Hz, one second.
  const commands = new Uint8Array([0x50, 0x8e, 0x50, 0x0f, 0x50, 0x90,
    0x61, 0x44, 0xac, 0x50, 0x9f, 0x66]);
  const bytes = new Uint8Array(0x100 + commands.length);
  const view = new DataView(bytes.buffer);
  bytes.set([0x56, 0x67, 0x6d, 0x20]); // "Vgm "
  view.setUint32(0x04, bytes.length - 4, true);
  view.setUint32(0x08, 0x150, true);
  view.setUint32(0x0c, 3579545, true); // PSG clock
  view.setUint32(0x18, 44100, true); // VGM timeline samples
  view.setUint32(0x2c, 7670454, true); // YM2612 clock
  view.setUint32(0x34, 0x100 - 0x34, true); // command data offset
  bytes.set(commands, 0x100);
      input = bytes;
    }
    signal.throwIfAborted();
    const download = document.getElementById('download');
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(new Blob([input], {type: 'application/octet-stream'}));
    download.href = downloadUrl;
    download.download = 'sample.vgm';
    download.textContent = 'Download input VGM';
    download.hidden = false;
    await vgm.load(input);
    signal.throwIfAborted();
    vgm.setLoopEnabled(false);
    await vgm.play();
    status.textContent = 'Playing…';
    pauseButton.disabled = false;
    // The parser can finish ahead of the speakers; also wait for output drain.
    while (vgm.getState().outputMode !== 'none') {
      detail.textContent = JSON.stringify(vgm.getState(), null, 2);
      await wait(50, signal);
    }
    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (vgm) await vgm.finalize();
    vgm = null;
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
  }
});
stopButton.addEventListener('click', () => { controller?.abort(); vgm?.stop(); });
pauseButton.addEventListener('click', () => {
  vgm?.pause();
  pauseButton.disabled = true;
  resumeButton.disabled = false;
  status.textContent = 'Paused.';
});
resumeButton.addEventListener('click', () => {
  vgm?.resume();
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  status.textContent = 'Playing…';
});
window.addEventListener('pagehide', () => {
  controller?.abort();
  void vgm?.finalize();
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
});

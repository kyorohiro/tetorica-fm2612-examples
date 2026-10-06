import {MegaDriveSynth} from 'tetorica-fm2612/megasynth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
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
let mega;
let downloadUrl;
window.addEventListener('pagehide', () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); });

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Loading…';
  try {
    mega = new MegaDriveSynth({
      workletUrl: runtimeAssetUrl('ym2612-worklet.js').href,
      ym2612WasmUrl: runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
      masterVolume: 0.25,
    });
    await mega.start();
    signal.throwIfAborted();
    mega.fm.setPreset(0, FM_PRESETS.sine);
    const download = document.getElementById('download');
    download.hidden = true;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = null;
    mega.startRecord();
    status.textContent = 'Recording…';
    for (const fnum of [553, 696, 829]) {
      mega.fm.noteOn(0, 4, fnum);
      await wait(180, signal);
      mega.fm.noteOff(0);
      await wait(100, signal);
    }
    mega.stopRecord();
    const recording = mega.exportRecording();
    const json = JSON.stringify(recording, null, 2);
    detail.textContent = json;
    downloadUrl = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
    download.href = downloadUrl;
    download.download = 'performance.json';
    download.textContent = 'Download event JSON';
    download.hidden = false;
    // Parse/import the saved format, then replay the commands with their timing.
    mega.importRecording(JSON.parse(json));
    status.textContent = 'Replaying…';
    mega.playRecording(null, {loop: false});
    await wait(recording.durationSeconds * 1000 + 250, signal);
    mega.stopRecordingPlayback();

    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (mega) await mega.close();
    mega = null;
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});
stopButton.addEventListener('click', () => { controller?.abort(); void mega?.close(); });
window.addEventListener('pagehide', () => { controller?.abort(); void mega?.close(); });

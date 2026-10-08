import {MegaSynth} from 'tetorica-fm2612/megasynth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {createDelayFX, createReverbFX} from 'tetorica-fm2612/megasynth_fx.js';

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
    // Built-in chips also expose IDs for per-chip output mixing.
    mega.mixer.set(mega.fm.id, {volume: 0.8, pan: 0, muted: false});
    mega.fm.setPreset(0, FM_PRESETS.sine);
    // These effects run in Web Audio, after the chip output.
    const delay = createDelayFX(mega.audioContext, {time: 0.12, feedback: 0.3, mix: 0.25});
    const reverb = createReverbFX(mega.audioContext, {seconds: 0.5, mix: 0.15});
    mega.setFXChain([delay, reverb]);
    detail.textContent = 'YM2612 → Delay → Reverb → master gain → speakers';
    status.textContent = 'Playing…';
    for (const fnum of [553, 696, 829]) {
      mega.fm.noteOn(0, 4, fnum);
      await wait(240, {signal});
      mega.fm.noteOff(0);
      await wait(100, {signal});
    }
    await wait(600, {signal});

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

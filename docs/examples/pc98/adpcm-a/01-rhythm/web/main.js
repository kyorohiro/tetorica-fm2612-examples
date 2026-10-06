import {createSoundChip} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {YM2608Synth, YM2608WorkletTransport} from 'tetorica-fm2612/ym2608synth.js';

async function play(fm, signal) {
  const romResponse = await fetch(runtimeAssetUrl('tetorica_ym2608_adpcm_rom.bin'), {signal});
  if (!romResponse.ok) throw new Error(`Rhythm ROM: HTTP ${romResponse.status}`);
  const rhythmRom = new Uint8Array(await romResponse.arrayBuffer());
  signal.throwIfAborted();
  // This is Tetorica's original replacement ROM shipped with the package.
  // YM2608 rhythm uses six fixed ADPCM-A voices, not arbitrary sample ranges.
  fm.rhythm.loadRom(rhythmRom);
  fm.rhythm.setVolume(45);
  for (const voice of ['bassDrum', 'snare', 'hiHat']) {
    fm.rhythm.setVoice(voice, {volume: 25, left: true, right: true});
    fm.rhythm.keyOn(voice);
    await wait(200, signal);
    fm.rhythm.keyOff(voice);
    await wait(100, signal);
  }
}

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
let controller;
let transport;
playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true; stopButton.disabled = false;
  status.textContent = 'Loading…';
  let chip;
  try {
    chip = await createSoundChip('ym2608', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new YM2608WorkletTransport(chip);
    const fm = new YM2608Synth({transport});
    await transport.start();
    status.textContent = 'Playing…';
    await play(fm, signal);
    await transport.flush();
    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    await transport?.close(); await chip?.dispose();
    transport = null; controller = null;
    playButton.disabled = false; stopButton.disabled = true;
  }
});
stopButton.addEventListener('click', () => {controller?.abort(); void transport?.close();});
window.addEventListener('pagehide', () => {controller?.abort(); void transport?.close();});

// Audio rendering is driven by AudioWorklet; this timer sets the note durations.
function wait(milliseconds, signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const done = () => {signal.removeEventListener('abort', abort); resolve();};
    const timer = setTimeout(done, milliseconds);
    function abort() {clearTimeout(timer); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

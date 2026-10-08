import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth, NesApuWorkletTransport} from 'tetorica-fm2612/nesapusynth.js';

async function play(nes, {signal}) {
  nes.pulse.setVoice(0, {duty: 0.25, volume: 8});
  nes.pulse.setVoice(1, {duty: 0.5, volume: 5});
  nes.noise.setVoice({volume: 4, period: 6});
  for (const note of ['C4', 'E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4']) {
    nes.pulse.noteOn(0, note);
    nes.pulse.noteOn(1, 'G3');
    nes.triangle.noteOn('C3'); // Triangle has a fixed hardware volume.
    nes.noise.noteOn();
    await wait(40, {signal});
    nes.noise.noteOff();
    await wait(160, {signal});
    nes.pulse.noteOff(0); nes.pulse.noteOff(1); nes.triangle.noteOff();
    await wait(40, {signal});
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
    chip = await createSoundChip('nes', {execution: 'worklet', gain: 0.6, signal});
    signal.throwIfAborted();
    transport = new NesApuWorkletTransport(chip);
    const nes = new NesApuSynth({transport});
    await transport.start();
    status.textContent = 'Playing…';
    await play(nes, {signal});
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
function wait(milliseconds, {signal}) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const done = () => {signal.removeEventListener('abort', abort); resolve();};
    const timer = setTimeout(done, milliseconds);
    function abort() {clearTimeout(timer); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

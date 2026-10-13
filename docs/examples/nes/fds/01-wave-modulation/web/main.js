import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth, NesApuWorkletTransport} from 'tetorica-fm2612/nesapusynth.js';

async function play(nes, {signal}) {
  nes.fds.setWave(Array.from({length: 64}, (_, i) =>
    Math.round(31.5 + 23 * Math.sin(i * Math.PI / 32) + 8 * Math.sin(i * Math.PI / 16))));
  nes.fds.setVolume(24);
  for (const enabled of [false, true]) {
    nes.fds.setModulation({
      table: Array.from({length: 32}, (_, i) => i < 16 ? 1 : 7),
      rate: 80, depth: 10, bias: 0, enabled,
    });
    for (const note of ['C4', 'E4', 'G4', 'C5']) {
      nes.fds.noteOn(note);
      await wait(300, {signal});
      nes.fds.noteOff();
      await wait(50, {signal});
    }
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
    chip = await createSoundChip('nes', {execution: 'worklet', gain: 0.6, signal, fds: true});
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

import {createSoundChip} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

async function play(gb, signal) {
  gb.initialize();
  const triangle = Array.from({length: 32}, (_, i) => i < 16 ? i : 31 - i);
  const sawtooth = Array.from({length: 32}, (_, i) => Math.floor(i / 2));
  for (const waveform of [triangle, sawtooth]) {
    gb.wave.setWaveform(waveform); // Stops the wave DAC while writing RAM.
    gb.wave.setLevel(0.5);
    gb.wave.setNote('C4');
    gb.wave.keyOn();
    await wait(500, signal);
    gb.wave.keyOff();
    await wait(150, signal);
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
    chip = await createSoundChip('gameboy', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new GameboyWorkletTransport(chip);
    const gb = new GameboySynth({transport});
    await transport.start();
    status.textContent = 'Playing…';
    await play(gb, signal);
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

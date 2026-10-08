import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth, NesApuWorkletTransport} from 'tetorica-fm2612/nesapusynth.js';

async function play(nes, {signal}) {
  // DMC consumes encoded DPCM bytes, not ordinary PCM. No cartridge or ROM needed.
  const bytes = Uint8Array.from({length: 257}, (_, i) => i % 8 < 4 ? 0xff : 0x00);
  await nes.dmc.loadSample(bytes); // Await Worklet memory acknowledgement before play().
  signal.throwIfAborted();
  for (const rate of [8, 12, 15]) {
    nes.dmc.play({rate, loop: true, level: 64});
    await wait(500, {signal});
    nes.dmc.stop();
    await wait(100, {signal});
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

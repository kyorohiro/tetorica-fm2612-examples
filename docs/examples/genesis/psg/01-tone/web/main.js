import {createSoundChip} from 'tetorica-fm2612';
import {SegaPSGSynth} from 'tetorica-fm2612/segapsgsynth.js';
import {SegaPSGWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

async function play(psg, signal) {
  psg.tone(0, {frequency: 440, attenuation: 4});
  await wait(600, signal);
  psg.off(0);
  await wait(200, signal);
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
    chip = await createSoundChip('segapsg', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new SegaPSGWorkletTransport(chip);
    const psg = new SegaPSGSynth({transport});
    await transport.start();
    status.textContent = 'Playing…';
    await play(psg, signal);
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

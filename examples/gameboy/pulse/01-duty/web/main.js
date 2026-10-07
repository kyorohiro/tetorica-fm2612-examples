import {createSoundChip} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

async function play(gb, {signal}) {
  gb.initialize();
  for (const duty of [0.125, 0.25, 0.5, 0.75]) {
    gb.pulse.setVoice(0, {duty, volume: 10, envelope: {direction: 'down', period: 0}});
    gb.pulse.setNote(0, 'C4');
    gb.pulse.keyOn(0);
    await wait(300, {signal});
    gb.pulse.keyOff(0);
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
    chip = await createSoundChip('gameboy', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new GameboyWorkletTransport(chip);
    const gb = new GameboySynth({transport});
    await transport.start();
    status.textContent = 'Playing…';
    await play(gb, {signal});
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

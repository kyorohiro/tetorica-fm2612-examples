import {createSoundChip} from 'tetorica-fm2612';
import {YM2608Synth, YM2608WorkletTransport} from 'tetorica-fm2612/ym2608synth.js';

async function play(fm, {signal}) {
  fm.ssg.tone(0, {frequency: 440, volume: 10});
  await wait(600, {signal});
  fm.ssg.off(0);
  await wait(200, {signal});
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
    await play(fm, {signal});
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

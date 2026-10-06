import {createSoundChip} from 'tetorica-fm2612';
import {YM2612Synth, YM2612WorkletTransport} from 'tetorica-fm2612/ym2612synth.js';

async function play(fm, signal) {
  fm.setAlgo(0, 7, 0);
  fm.setPan(0, true, true);
  for (let operator = 0; operator < 4; operator++) {
    fm.setOperator(0, operator, {
      dt: 0, multi: 1, tl: operator === 3 ? 8 : 127,
      ar: 22, d1r: 6, d2r: 3, sl: 3, rr: 8,
    });
  }
  fm.noteOn(0, 4, 553);
  await wait(600, signal);
  fm.noteOff(0);
  await wait(300, signal);
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
    chip = await createSoundChip('ym2612', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new YM2612WorkletTransport(chip);
    const fm = new YM2612Synth({transport});
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

import {createSoundChip} from 'tetorica-fm2612';
import {YM2151WorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

async function play(transport, signal) {
  transport.reset();
  transport.write(0, 0x20);
  transport.write(1, 0xc7); // Both outputs, algorithm 7, feedback 0.
  for (let operator = 0; operator < 4; operator++) {
    const offset = operator * 8;
    transport.write(0, 0x40 + offset);
    transport.write(1, 1); // Multiplier 1, detune 0.
    transport.write(0, 0x60 + offset);
    transport.write(1, operator === 3 ? 24 : 127);
    transport.write(0, 0x80 + offset);
    transport.write(1, 31); // Attack.
    transport.write(0, 0xa0 + offset);
    transport.write(1, 0);  // First decay.
    transport.write(0, 0xc0 + offset);
    transport.write(1, 0);  // Second decay / detune 2.
    transport.write(0, 0xe0 + offset);
    transport.write(1, 15); // Sustain level 0, release 15.
  }
  transport.write(0, 0x28);
  transport.write(1, 0x4a); // Key code: octave and semitone bits.
  transport.write(0, 0x30);
  transport.write(1, 0);    // Key fraction 0.
  transport.write(0, 0x08);
  transport.write(1, 0x40); // Key on C2 (operator 3), channel 0.
  await wait(600, signal);
  transport.write(0, 0x08);
  transport.write(1, 0);    // Key off channel 0.
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
    chip = await createSoundChip('ym2151', {execution: 'worklet', signal});
    signal.throwIfAborted();
    transport = new YM2151WorkletTransport(chip);
    await transport.start();
    status.textContent = 'Playing…';
    await play(transport, signal);
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

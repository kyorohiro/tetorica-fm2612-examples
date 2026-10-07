import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2608Synth, YM2608WorkletTransport} from 'tetorica-fm2612/ym2608synth.js';

async function play(fm, {signal}) {
  // Original decoded PCM: a 440 Hz sine with 10 ms fades.
  const sourceSampleRate = 8000;
  const sourceFrames = 4000;
  const wave = new Float32Array(sourceFrames);
  for (let i = 0; i < sourceFrames; i++) {
    const fade = Math.min(1, i / 80, (sourceFrames - 1 - i) / 80);
    wave[i] = 0.6 * fade * Math.sin(i * 2 * Math.PI * 440 / sourceSampleRate);
  }

  // loadSample encodes PCM to ADPCM-B, uploads it and selects range/rate.
  // It does not set volume/pan or start playback. Address is 32-byte aligned.
  const pcmSample = await fm.adpcm.loadSample(
    {channels: [wave], sampleRate: sourceSampleRate},
    {address: 0},
  );
  fm.adpcm.setVolume(180);
  fm.adpcm.setPan(true, true);
  fm.adpcm.keyOn();
  await wait(Math.round(((pcmSample.duration + 0.05)) * 1000), {signal});
  fm.adpcm.keyOff();

  // A complete WAV file is also accepted. Create one here so no external
  // file is needed; encodeWav() is provided by the npm package.
  const sourceWav = encodeWav({left: wave, right: wave, sampleRate: sourceSampleRate});
  // Reserve another memory range: 4096 does not overlap the first sample.
  const wavSample = await fm.adpcm.loadSample(sourceWav, {address: 4096});
  fm.adpcm.setPlaybackRate(wavSample.sampleRate * 1.5);
  fm.adpcm.keyOn();
  await wait(Math.round(((wavSample.duration / 1.5 + 0.05)) * 1000), {signal});
  fm.adpcm.keyOff();
  await wait(100, {signal});
  // loadMemory() instead expects already-encoded ADPCM-B, not PCM or WAV.
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

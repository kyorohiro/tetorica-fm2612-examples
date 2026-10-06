import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2608Synth, YM2608DirectTransport} from 'tetorica-fm2612/ym2608synth.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
const download = document.getElementById('download');
let controller;
let context;
let source;
let downloadUrl;

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  download.hidden = true;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  status.textContent = 'Rendering…';
  let chip;
  try {
    // Start browser audio directly from the user's click.
    context = new AudioContext();
    await context.resume();

    // The package loads its WASM automatically in browsers and Node.
    chip = await createSoundChip('ym2608', {signal});
    signal.throwIfAborted();

    const chipSampleRate = chip.sampleRate();
    const transport = new YM2608DirectTransport(chip);
    const fm = new YM2608Synth({transport});
    const segments = [];
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
    segments.push(chip.generateStereo(Math.round(chipSampleRate * (pcmSample.duration + 0.05))));
    fm.adpcm.keyOff();

    // A complete WAV file is also accepted. Create one here so no external
    // file is needed; encodeWav() is provided by the npm package.
    const sourceWav = encodeWav({left: wave, right: wave, sampleRate: sourceSampleRate});
    // Reserve another memory range: 4096 does not overlap the first sample.
    const wavSample = await fm.adpcm.loadSample(sourceWav, {address: 4096});
    fm.adpcm.setPlaybackRate(wavSample.sampleRate * 1.5);
    fm.adpcm.keyOn();
    segments.push(chip.generateStereo(Math.round(chipSampleRate * (wavSample.duration / 1.5 + 0.05))));
    fm.adpcm.keyOff();
    segments.push(chip.generateStereo(Math.round(chipSampleRate * 0.1)));
    // loadMemory() instead expects already-encoded ADPCM-B, not PCM or WAV.
    // Concatenate the generated segments in their original order.
    const frames = segments.reduce((sum, segment) => sum + segment.left.length, 0);
    const nativeLeft = new Float32Array(frames);
    const nativeRight = new Float32Array(frames);
    let offset = 0;
    for (const segment of segments) {
      nativeLeft.set(segment.left, offset);
      nativeRight.set(segment.right, offset);
      offset += segment.left.length;
    }

    // YM2608's native rate is too high for a browser AudioBuffer.
    // Convert the PCM to 44.1 kHz with linear interpolation in this example.
    const sampleRate = 44100;
    const outputFrames = Math.round(frames * sampleRate / chipSampleRate);
    const left = new Float32Array(outputFrames);
    const right = new Float32Array(outputFrames);
    for (let i = 0; i < outputFrames; i++) {
      const position = i * chipSampleRate / sampleRate;
      const first = Math.min(Math.floor(position), frames - 1);
      const second = Math.min(first + 1, frames - 1);
      const fraction = position - first;
      left[i] = nativeLeft[first] * (1 - fraction) + nativeLeft[second] * fraction;
      right[i] = nativeRight[first] * (1 - fraction) + nativeRight[second] * fraction;
    }

    // The PCM arrays are owned copies, so the chip can be released now.
    chip.dispose();
    chip = null;

    const wav = encodeWav({left, right, sampleRate}, {gain: 0.25});
    downloadUrl = URL.createObjectURL(new Blob([wav], {type: 'audio/wav'}));
    download.href = downloadUrl;
    download.hidden = false;

    const buffer = context.createBuffer(2, left.length, sampleRate);
    buffer.copyToChannel(left, 0);
    buffer.copyToChannel(right, 1);
    source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = 0.25;
    source.connect(gain);
    gain.connect(context.destination);

    status.textContent = 'Playing…';
    await new Promise(resolve => {
      source.onended = resolve;
      signal.addEventListener('abort', resolve, {once: true});
      source.start();
    });
    status.textContent = signal.aborted ? 'Stopped.' : 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (chip) chip.dispose();
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
      source = null;
    }
    if (context && context.state !== 'closed') await context.close();
    context = null;
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});

stopButton.addEventListener('click', () => {
  controller?.abort();
});

window.addEventListener('pagehide', () => {
  controller?.abort();
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
});

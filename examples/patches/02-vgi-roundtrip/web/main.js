import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2612Synth, YM2612DirectTransport} from 'tetorica-fm2612/ym2612synth.js';
import {createVgiFromPreset, parseVgi} from 'tetorica-fm2612/vgi.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
const download = document.getElementById('download');
let controller;
let context;
let source;
let downloadUrl;
let patchUrl;

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
    chip = await createSoundChip('ym2612', {signal});
    signal.throwIfAborted();

    const sampleRate = chip.sampleRate();
    const transport = new YM2612DirectTransport(chip);
    const fm = new YM2612Synth({transport});
    const segments = [];
  const preset = {
    algorithm: 7, feedback: 0, pan: {left: true, right: true},
    operators: {
      1: {multi: 1, tl: 127, ar: 31, rr: 15},
      2: {multi: 1, tl: 127, ar: 31, rr: 15},
      3: {multi: 1, tl: 127, ar: 31, rr: 15},
      4: {multi: 1, tl: 8, ar: 31, rr: 15},
    },
  };
    const file = document.getElementById('file').files[0];
    const patchBytes = file ? new Uint8Array(await file.arrayBuffer()) : createVgiFromPreset(preset);
    const imported = parseVgi(patchBytes);
    fm.setPreset(0, imported);
    // Export the parsed logical preset back into the same binary format.
    const exported = createVgiFromPreset(imported);
    if (patchUrl) URL.revokeObjectURL(patchUrl);
    patchUrl = URL.createObjectURL(new Blob([exported], {type: 'application/octet-stream'}));
    const patchDownload = document.getElementById('patch-download');
    patchDownload.href = patchUrl;
    patchDownload.download = 'sample.vgi';
    patchDownload.hidden = false;
    document.getElementById('detail').textContent = JSON.stringify(imported, null, 2);
    fm.noteOn(0, 4, 553); // channel, block, F-number
    segments.push(transport.generateStereo(Math.round(sampleRate * 0.6)));
    fm.noteOff(0);
    segments.push(transport.generateStereo(Math.round(sampleRate * 0.2)));
    // Concatenate the generated segments in their original order.
    const frames = segments.reduce((sum, segment) => sum + segment.left.length, 0);
    const left = new Float32Array(frames);
    const right = new Float32Array(frames);
    let offset = 0;
    for (const segment of segments) {
      left.set(segment.left, offset);
      right.set(segment.right, offset);
      offset += segment.left.length;
    }

    // The PCM arrays are owned copies, so the chip can be released now.
    chip.dispose();
    chip = null;

    const wav = encodeWav({left, right, sampleRate}, {gain: 0.25});
    downloadUrl = URL.createObjectURL(new Blob([wav], {type: 'audio/wav'}));
    download.href = downloadUrl;
    download.download = 'patch-vgi.wav';
    download.textContent = 'Download WAV';
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
  if (patchUrl) URL.revokeObjectURL(patchUrl);
});

import {encodeWav} from 'tetorica-fm2612';
import {GameboyApu} from 'tetorica-fm2612/gameboyapu.js';
import moduleFactory from 'tetorica-fm2612/generated/gameboy_apu_wasm.js';
import {GameboySynth, GameboyDirectTransport} from 'tetorica-fm2612/gameboysynth.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

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

    // This individual wrapper receives its generated loader and WASM bytes.
    const response = await fetch(runtimeAssetUrl('generated/gameboy_apu_wasm.wasm'), {signal});
    if (!response.ok) throw new Error(`WASM: HTTP ${response.status}`);
    const wasmBinary = new Uint8Array(await response.arrayBuffer());
    chip = await GameboyApu.create({moduleFactory, moduleOptions: {wasmBinary}});
    signal.throwIfAborted();

    const sampleRate = chip.sampleRate();
    const gb = new GameboySynth({transport: new GameboyDirectTransport(chip)});
    gb.initialize();
    const segments = [];
    for (const width of [15, 7]) {
      gb.noise.setVoice({volume: 10, envelope: {direction: 'down', period: 1},
        divisor: 3, shift: 4, width});
      gb.noise.keyOn();
      segments.push(chip.generateStereo(Math.round(sampleRate * 0.4)));
      gb.noise.keyOff();
      segments.push(chip.generateStereo(Math.round(sampleRate * 0.15)));
    }
    gb.dispose();
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

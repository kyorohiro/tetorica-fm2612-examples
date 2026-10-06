import {createSoundChip, encodeWav} from 'tetorica-fm2612';

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
    chip = await createSoundChip('ym2612', {signal});
    signal.throwIfAborted();

    const sampleRate = chip.sampleRate();
    const segments = [];
    // writeRegister(address, value, port): channel 0, port 0.
    for (const address of [0x40, 0x44, 0x48]) chip.writeRegister(address, 127, 0);
    chip.writeRegister(0x3c, 1, 0);    // OP4: multiplier 1
    chip.writeRegister(0x4c, 8, 0);    // OP4: total level
    chip.writeRegister(0x5c, 31, 0);   // attack
    chip.writeRegister(0x6c, 0, 0);    // decay
    chip.writeRegister(0x7c, 0, 0);    // sustain rate
    chip.writeRegister(0x8c, 15, 0);   // release
    chip.writeRegister(0xb0, 7, 0);    // algorithm 7
    chip.writeRegister(0xb4, 0xc0, 0); // left + right
    chip.writeRegister(0xa4, (4 << 3) | (553 >> 8), 0);
    chip.writeRegister(0xa0, 553 & 0xff, 0);
    chip.writeRegister(0x28, 0xf0, 0);  // key on
    segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
    chip.writeRegister(0x28, 0x00, 0);  // key off
    segments.push(chip.generateStereo(Math.round(sampleRate * 0.2)));
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

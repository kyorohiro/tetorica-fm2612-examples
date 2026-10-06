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
    chip = await createSoundChip('ym2151', {signal});
    signal.throwIfAborted();

    // X68000 uses a 4 MHz YM2151. Register writes below select channel 0.
    const sampleRate = chip.sampleRate(4000000);
    const segments = [];
    chip.reset();
    chip.write(0, 0x20);
    chip.write(1, 0xc7); // Both outputs, algorithm 7, feedback 0.
    for (let operator = 0; operator < 4; operator++) {
      const offset = operator * 8;
      chip.write(0, 0x40 + offset);
      chip.write(1, 1); // Multiplier 1, detune 0.
      chip.write(0, 0x60 + offset);
      chip.write(1, operator === 3 ? 24 : 127);
      chip.write(0, 0x80 + offset);
      chip.write(1, 31); // Attack.
      chip.write(0, 0xa0 + offset);
      chip.write(1, 0);  // First decay.
      chip.write(0, 0xc0 + offset);
      chip.write(1, 0);  // Second decay / detune 2.
      chip.write(0, 0xe0 + offset);
      chip.write(1, 15); // Sustain level 0, release 15.
    }
    chip.write(0, 0x28);
    chip.write(1, 0x4a); // Key code: octave and semitone bits.
    chip.write(0, 0x30);
    chip.write(1, 0);    // Key fraction 0.
    chip.write(0, 0x08);
    chip.write(1, 0x40); // Key on C2 (operator 3), channel 0.
    segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
    chip.write(0, 0x08);
    chip.write(1, 0);    // Key off channel 0.
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

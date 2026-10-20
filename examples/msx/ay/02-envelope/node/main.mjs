// Node.js 22+: native AY PCM to WAV, without an audio device.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {AY8910Synth, AY8910DirectTransport, AY8910_CLOCK} from 'tetorica-fm2612/ay8910synth.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// AY's constructor accepts a PCM sample rate independently of its input clock.
const chip = await createSoundChip('ay8910', {clock: AY8910_CLOCK, sampleRate: 44100});
const transport = new AY8910DirectTransport(chip);
const ay = new AY8910Synth({transport, clock: AY8910_CLOCK});
try {
  const sampleRate = transport.sampleRate();
  const chunks = [];
  let elapsedSeconds = 0, renderedFrames = 0;
  // Cumulative rounding keeps each note boundary on the same sample clock.
  function renderSeconds(seconds) {
    elapsedSeconds += seconds;
    const endFrame = Math.round(elapsedSeconds * sampleRate);
    chunks.push(transport.generateStereo(endFrame - renderedFrames));
    renderedFrames = endFrame;
  }

  ay.initialize();
  renderSeconds(0.03); // A silent baseline for the export DC filter.
  console.log('Two voices share one hardware envelope');
  ay.setEnvelope({period: 1200, shape: 10}); // Repeating triangle; period is raw 16-bit units.
  ay.tone(0, {note: 'C4', volume: 9, envelope: true});
  ay.tone(1, {note: 'G4', volume: 9, envelope: true});
  // With envelope:true, the shared envelope replaces BOTH fixed volume values.
  renderSeconds(1.1);

  console.log('Period-only edit: preserve the shared envelope phase');
  ay.setEnvelope({period: 2400});
  renderSeconds(0.9);

  console.log('Writing shape retriggers the envelope for BOTH voices');
  ay.setEnvelope({shape: 12}); // Repeating rising ramp.
  renderSeconds(1.1);

  console.log('New repeating triangle shape, shared by both voices');
  ay.setEnvelope({shape: 14});
  renderSeconds(0.9);
  ay.allNotesOff(); // Envelope-enabled voices also stop.
  renderSeconds(0.25);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}

  // Output shaping, separate from chip programming: native AY DAC PCM has a
  // DC baseline. A 20 Hz DC blocker plus 5 ms edge fades make a clean WAV.
  const pole = Math.exp(-2 * Math.PI * 20 / sampleRate);
  const fadeFrames = Math.max(1, Math.round(sampleRate * 0.005));
  let previousInput = left[0] ?? 0, previousOutput = 0;
  for (let i = 0; i < renderedFrames; i++) {
    const input = left[i];
    const filtered = pole * (previousOutput + input - previousInput);
    previousInput = input; previousOutput = filtered;
    const edge = Math.max(0, Math.min(1, i / fadeFrames, (renderedFrames - 1 - i) / fadeFrames));
    left[i] = right[i] = filtered * edge; // AY is mono; send it to both channels.
  }
  const defaultPath = fileURLToPath(new URL('../../../../../output/msx-ay-envelope.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.35}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · AY-3-8910`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip; dispose the owner explicitly.
}

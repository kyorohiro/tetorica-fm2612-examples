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
  console.log('A4 = MIDI 69 = 440 Hz; physical channels are 0..2');
  ay.tone(0, {note: 'A4', volume: 9}); // 0=silent, 15=loudest.
  renderSeconds(0.6);
  ay.keyOff(0);
  renderSeconds(0.1);

  console.log('Three tone voices: C4 / E4 / G4');
  for (const [channel, note] of [[0, 'C4'], [1, 'E4'], [2, 'G4']]) {
    ay.tone(channel, {note, volume: 7});
  }
  renderSeconds(0.65);
  ay.allNotesOff();
  renderSeconds(0.1);

  console.log('Two voices share the SAME noise generator');
  ay.noise(0, {period: 6, volume: 8});
  ay.noise(1, {period: 6, volume: 6});
  renderSeconds(0.5);
  ay.setNoisePeriod(22); // Changes BOTH noise-enabled voices.
  renderSeconds(0.5);

  console.log('Tone and noise together on CH0');
  ay.keyOff(1);
  ay.setVoice(0, {tone: true, noise: true, note: 'A3', volume: 9, envelope: false});
  renderSeconds(0.65);
  ay.allNotesOff();
  renderSeconds(0.2);

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
  const defaultPath = fileURLToPath(new URL('../../../../../output/msx-ay-tone-noise.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate}, {gain: 0.35}));
  console.log(`${output}\n${renderedFrames} frames · ${sampleRate} Hz · stereo PCM16 · AY-3-8910`);
} finally {
  chip.dispose(); // DirectTransport borrows the chip; dispose the owner explicitly.
}

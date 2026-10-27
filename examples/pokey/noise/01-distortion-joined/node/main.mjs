// Node.js 22+: offline speaker-boundary PCM; no audio device or wall-clock wait.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {PokeySynth} from 'tetorica-fm2612/pokeysynth.js';
import {PokeyAudioEngine} from 'tetorica-fm2612/pokeyaudioengine.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const CLOCK = 1789790;
const SAMPLE_RATE = 44100;
const OUTPUT_GAIN = 0.25; // Applied once in encodeWav(), not in the unity engines.
const engines = [];
try {
  const chip = await createSoundChip('pokey', {clock: CLOCK, sampleRate: SAMPLE_RATE});
  const engine = new PokeyAudioEngine(chip, 1);
  engines.push(engine);
  // Do not use raw chip writes: the engine shadows AUDC for exact all-off silence.
  const transport = {clock: chip.clock, writeRegister: (register, value) => engine.writeRegister(register, value), reset: () => engine.reset()};
  const pokey = new PokeySynth({transport, clock: chip.clock});
  const chunks = [];
  let renderedFrames = 0;
  function renderSeconds(seconds) {
    const frames = Math.round(seconds * SAMPLE_RATE);
    chunks.push(engine.processFrames(frames)); // Owned PCM copies, safe across later renders.
    renderedFrames += frames;
  }

  pokey.initialize(); // Silent defaults; CH0..3 are physical channels.
  pokey.setVolume(0, 7);
  // AUDCTL (including poly9) is shared: stop all voices before changing it.
  const colors = [
    {distortion: 5, poly9: false, label: 'pure square (5)'},
    {distortion: 2, poly9: false, label: 'poly5 + poly4 (2)'},
    {distortion: 0, poly9: false, label: 'poly5 + poly17 (0)'},
    {distortion: 0, poly9: true, label: 'poly5 + poly9 (0)'},
  ];
  for (const color of colors) {
    pokey.allNotesOff();
    pokey.setPoly9(color.poly9);
    pokey.setDistortion(0, color.distortion);
    pokey.noteOn(0, 'B4'); // Same timer target; B4 avoids a poly9 timer alias, unlike A4.
    console.log(color.label);
    renderSeconds(0.45);
    pokey.allNotesOff();
    renderSeconds(0.1);
  }
  pokey.allNotesOff();
  pokey.setPoly9(false);
  pokey.setHighClock(0, true);
  pokey.setJoined(0, true); // Pair (CH0, CH1): lower CH0 becomes a timer helper.
  pokey.setDistortion(1, 5);
  pokey.setVolume(1, 7);
  console.log('16-bit joined pair with high clock: tune/key upper CH1 only');
  for (const note of ['C2', 'G2', 'C3', 'E3']) {
    pokey.noteOn(1, note); // Never noteOn() or setFrequency() on joined lower CH0.
    renderSeconds(0.35);
    pokey.allNotesOff();
    renderSeconds(0.1);
  }
  renderSeconds(0.1);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Unity 10 Hz DC blocking matches the Web speaker boundary. No normalization.
  // All Synth writes/reset pass through the engine, keeping its silence gate current.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/pokey-noise-01-distortion-joined.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate: SAMPLE_RATE}, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${renderedFrames} frames · ${SAMPLE_RATE} Hz · mono duplicated to stereo PCM16 · POKEY noise / joined · gain ${OUTPUT_GAIN}`);
} finally {
  for (const engine of engines) engine.dispose(); // Each engine owns its real chip.
}

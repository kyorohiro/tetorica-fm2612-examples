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

  pokey.initialize(); // Silent defaults, distortion 5 = pure square; CH0..3.
  for (const [ch, volume] of [5, 4, 3, 2].entries()) {
    pokey.setDistortion(ch, 5);
    pokey.setVolume(ch, volume); // Retained until noteOn(); hardware range 0..15.
  }
  console.log('4 physical channels, mono; A4 = 440 Hz; output gain 0.25');
  const lead = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A5', 'G5'];
  for (let i = 0; i < lead.length; i++) {
    pokey.noteOn(0, lead[i]);
    pokey.noteOn(1, i < 4 ? 'E4' : 'F4');
    pokey.noteOn(2, i < 4 ? 'C3' : 'D3');
    pokey.noteOn(3, i % 2 ? 'G3' : 'C4');
    renderSeconds(0.32);
    pokey.allNotesOff();
    renderSeconds(0.08);
  }
  renderSeconds(0.1);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Unity 10 Hz DC blocking matches the Web speaker boundary. No normalization.
  // All Synth writes/reset pass through the engine, keeping its silence gate current.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/pokey-tone-01-four-channels.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate: SAMPLE_RATE}, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${renderedFrames} frames · ${SAMPLE_RATE} Hz · mono duplicated to stereo PCM16 · POKEY 4CH · gain ${OUTPUT_GAIN}`);
} finally {
  for (const engine of engines) engine.dispose(); // Each engine owns its real chip.
}

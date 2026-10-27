// Node.js 22+: offline speaker-boundary PCM; no audio device or wall-clock wait.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {PokeySynth} from 'tetorica-fm2612/pokeysynth.js';
import {PokeyAudioEngine} from 'tetorica-fm2612/pokeyaudioengine.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const CLOCK = 1789773;
const SAMPLE_RATE = 44100;
const OUTPUT_GAIN = 0.25; // Applied once in encodeWav(), not in the unity engines.
const engines = [];
try {
  const pokeys = [];
  for (let i = 0; i < 2; i++) {
    const chip = await createSoundChip('pokey', {clock: CLOCK, sampleRate: SAMPLE_RATE});
    const engine = new PokeyAudioEngine(chip, 1);
    engines.push(engine);
    // Separate core, engine register shadow and Synth for each four-voice chip.
    const transport = {clock: chip.clock, writeRegister: (register, value) => engine.writeRegister(register, value), reset: () => engine.reset()};
    pokeys.push(new PokeySynth({transport, clock: chip.clock}));
  }
  const chunks = [];
  let renderedFrames = 0;
  function renderSeconds(seconds) {
    const frames = Math.round(seconds * SAMPLE_RATE);
    const first = engines[0].processFrames(frames), second = engines[1].processFrames(frames);
    const left = new Float32Array(frames), right = new Float32Array(frames);
    for (let i = 0; i < frames; i++) {
      // Host mono sum of two independent chips, not a hardware stereo feature.
      left[i] = right[i] = first.left[i] + second.left[i];
    }
    chunks.push({left, right});
    renderedFrames += frames;
  }

  for (const [i, pokey] of pokeys.entries()) {
    pokey.initialize(); // Each independent core owns physical CH0..3.
    const volumes = i === 0 ? [5, 4, 3, 2] : [3, 2, 2, 1];
    for (const [ch, volume] of volumes.entries()) {
      pokey.setDistortion(ch, 5); // Pure square.
      pokey.setVolume(ch, volume);
    }
  }
  console.log('2 independent POKEYs × 4 voices = 8 real voices; mono host sum');
  console.log('Each phrase: both 8 voices, then core A off while core B keeps 4 voices');
  console.log('Both input clocks 1789773 Hz; host output gain 0.25 per core');
  const lead = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A5', 'G5'];
  for (let i = 0; i < lead.length; i++) {
    pokeys[0].noteOn(0, lead[i]);
    pokeys[0].noteOn(1, i < 4 ? 'E4' : 'F4');
    pokeys[0].noteOn(2, i < 4 ? 'C3' : 'D3');
    pokeys[0].noteOn(3, i % 2 ? 'G3' : 'C4');
    pokeys[1].noteOn(0, i < 4 ? 'G4' : 'A4');
    pokeys[1].noteOn(1, i < 4 ? 'E5' : 'F5');
    pokeys[1].noteOn(2, i < 4 ? 'C6' : 'D6');
    pokeys[1].noteOn(3, i < 4 ? 'E6' : 'F6');
    renderSeconds(0.16);
    pokeys[0].allNotesOff(); // Core B keeps sounding: independent state and gates.
    renderSeconds(0.16);
    for (const pokey of pokeys) pokey.allNotesOff();
    renderSeconds(0.08);
  }
  renderSeconds(0.1);

  const left = new Float32Array(renderedFrames), right = new Float32Array(renderedFrames);
  let offset = 0;
  for (const chunk of chunks) {left.set(chunk.left, offset); right.set(chunk.right, offset); offset += chunk.left.length;}
  // Unity 10 Hz DC blocking matches the Web speaker boundary. No normalization.
  // All Synth writes/reset pass through the engine, keeping its silence gate current.
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../../output/pokey-dual-01-eight-channels.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left, right, sampleRate: SAMPLE_RATE}, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${renderedFrames} frames · ${SAMPLE_RATE} Hz · mono duplicated to stereo PCM16 · Dual POKEY 4+4CH · gain ${OUTPUT_GAIN}`);
} finally {
  for (const engine of engines) engine.dispose(); // Each engine owns its real chip.
}

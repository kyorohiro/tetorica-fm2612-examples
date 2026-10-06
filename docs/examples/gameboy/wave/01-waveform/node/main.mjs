import {createSoundChip} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(gb) {
  gb.initialize();
  const triangle = Array.from({length: 32}, (_, i) => i < 16 ? i : 31 - i);
  const sawtooth = Array.from({length: 32}, (_, i) => Math.floor(i / 2));
  for (const waveform of [triangle, sawtooth]) {
    gb.wave.setWaveform(waveform); // Stops the wave DAC while writing RAM.
    gb.wave.setLevel(0.5);
    gb.wave.setNote('C4');
    gb.wave.keyOn();
    await wait(500);
    gb.wave.keyOff();
    await wait(150);
  }
}

const chip = await createSoundChip('gameboy');
const transport = new GameboyAudifyTransport(chip);
const gb = new GameboySynth({transport});
try {
  await transport.start();
  console.log('Playing…');
  await play(gb);
  await transport.stop();
} finally {
  await transport.close(); chip.dispose();
}
console.log('Finished: audio output closed.');
function wait(milliseconds) {return new Promise(resolve => setTimeout(resolve, milliseconds));}

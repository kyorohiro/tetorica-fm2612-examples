import {createSoundChip} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(gb) {
  gb.initialize();
  for (const width of [15, 7]) {
    gb.noise.setVoice({volume: 10, envelope: {direction: 'down', period: 1},
      divisor: 3, shift: 4, width});
    gb.noise.keyOn();
    await wait(400);
    gb.noise.keyOff();
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

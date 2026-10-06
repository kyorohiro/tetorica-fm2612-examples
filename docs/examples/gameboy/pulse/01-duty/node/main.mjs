import {createSoundChip} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(gb) {
  gb.initialize();
  for (const duty of [0.125, 0.25, 0.5, 0.75]) {
    gb.pulse.setVoice(0, {duty, volume: 10, envelope: {direction: 'down', period: 0}});
    gb.pulse.setNote(0, 'C4');
    gb.pulse.keyOn(0);
    await wait(300);
    gb.pulse.keyOff(0);
    await wait(100);
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

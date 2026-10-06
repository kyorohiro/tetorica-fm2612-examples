import {createSoundChip} from 'tetorica-fm2612';
import {YM2608Synth} from 'tetorica-fm2612/ym2608synth.js';
import {YM2608AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  fm.ssg.tone(0, {frequency: 440, volume: 10});
  await wait(600);
  fm.ssg.off(0);
  await wait(200);
}

const chip = await createSoundChip('ym2608');
const transport = new YM2608AudifyTransport(chip);
const fm = new YM2608Synth({transport});
try {
  await transport.start();
  console.log('Playing…');
  await play(fm);
  await transport.stop();
} finally {
  await transport.close(); chip.dispose();
}
console.log('Finished: audio output closed.');
function wait(milliseconds) {return new Promise(resolve => setTimeout(resolve, milliseconds));}

import {createSoundChip} from 'tetorica-fm2612';
import {SegaPSGSynth} from 'tetorica-fm2612/segapsgsynth.js';
import {SegaPSGAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(psg) {
  psg.tone(0, {frequency: 440, attenuation: 4});
  await wait(600);
  psg.off(0);
  await wait(200);
}

const chip = await createSoundChip('segapsg');
const transport = new SegaPSGAudifyTransport(chip);
const psg = new SegaPSGSynth({transport});
try {
  await transport.start();
  console.log('Playing…');
  await play(psg);
  await transport.stop();
} finally {
  await transport.close(); chip.dispose();
}
console.log('Finished: audio output closed.');
function wait(milliseconds) {return new Promise(resolve => setTimeout(resolve, milliseconds));}

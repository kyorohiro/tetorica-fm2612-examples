import {createSoundChip} from 'tetorica-fm2612';
import {SegaPSGSynth} from 'tetorica-fm2612/segapsgsynth.js';
import {SegaPSGAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(psg) {
  for (const type of ['periodic', 'white']) {
    psg.noise({type, rate: 'high', attenuation: 4});
    await wait(500);
    psg.setAttenuation(3, 15);
    await wait(200);
  }
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

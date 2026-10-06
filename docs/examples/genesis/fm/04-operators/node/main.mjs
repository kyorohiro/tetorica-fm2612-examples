import {createSoundChip} from 'tetorica-fm2612';
import {YM2612Synth} from 'tetorica-fm2612/ym2612synth.js';
import {YM2612AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  fm.setAlgo(0, 7, 0);
  fm.setPan(0, true, true);
  for (let operator = 0; operator < 4; operator++) {
    fm.setOperator(0, operator, {
      dt: 0, multi: 1, tl: operator === 3 ? 8 : 127,
      ar: 22, d1r: 6, d2r: 3, sl: 3, rr: 8,
    });
  }
  fm.noteOn(0, 4, 553);
  await wait(600);
  fm.noteOff(0);
  await wait(300);
}

const chip = await createSoundChip('ym2612');
const transport = new YM2612AudifyTransport(chip);
const fm = new YM2612Synth({transport});
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

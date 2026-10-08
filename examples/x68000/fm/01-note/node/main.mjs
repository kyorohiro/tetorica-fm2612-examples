import {createSoundChip} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {YM2151Synth} from 'tetorica-fm2612/ym2151synth.js';
import {YM2151AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  fm.setPreset(0, FM_PRESETS.sine);
  fm.setOperator(0, 3, {tl: 24});
  fm.noteOn(0, 'A4');
  await wait(600);
  fm.noteOff(0);
  await wait(200);
}

const chip = await createSoundChip('ym2151');
const transport = new YM2151AudifyTransport(chip);
const fm = new YM2151Synth({transport});
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

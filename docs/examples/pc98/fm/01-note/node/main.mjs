import {createSoundChip} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {YM2608Synth} from 'tetorica-fm2612/ym2608synth.js';
import {YM2608AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  fm.setPreset(0, FM_PRESETS.sine);
  fm.noteOn(0, 4, 553);
  await wait(600);
  fm.noteOff(0);
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

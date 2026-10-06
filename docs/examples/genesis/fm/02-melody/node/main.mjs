import {createSoundChip} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {YM2612Synth} from 'tetorica-fm2612/ym2612synth.js';
import {YM2612AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  fm.setPreset(0, FM_PRESETS['two-op-bell']);
  for (const [block, fnum] of [[4, 617], [4, 693], [4, 778], [4, 925], [5, 617]]) {
    fm.noteOn(0, block, fnum);
    await wait(220);
    fm.noteOff(0);
    await wait(80);
  }
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

import {createSoundChip} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {YM2612Synth} from 'tetorica-fm2612/ym2612synth.js';
import {YM2612AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  const notes = [617, 778, 925];
  for (let channel = 0; channel < notes.length; channel++) {
    fm.setPreset(channel, FM_PRESETS['two-op-organ']);
    fm.noteOn(channel, 4, notes[channel]);
  }
  await wait(800);
  for (let channel = 0; channel < notes.length; channel++) fm.noteOff(channel);
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

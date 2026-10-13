import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth} from 'tetorica-fm2612/nesapusynth.js';
import {NesApuAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(nes) {
  nes.fds.setWave(Array.from({length: 64}, (_, i) =>
    Math.round(31.5 + 23 * Math.sin(i * Math.PI / 32) + 8 * Math.sin(i * Math.PI / 16))));
  nes.fds.setVolume(24);
  for (const enabled of [false, true]) {
    nes.fds.setModulation({
      table: Array.from({length: 32}, (_, i) => i < 16 ? 1 : 7),
      rate: 80, depth: 10, bias: 0, enabled,
    });
    for (const note of ['C4', 'E4', 'G4', 'C5']) {
      nes.fds.noteOn(note);
      await wait(300);
      nes.fds.noteOff();
      await wait(50);
    }
  }
}

const chip = await createSoundChip('nes', {fds: true});
const transport = new NesApuAudifyTransport(chip, {gain: 0.6});
const nes = new NesApuSynth({transport});
try {
  await transport.start();
  console.log('Playing…');
  await play(nes);
  await transport.stop();
} finally {
  await transport.close(); chip.dispose();
}
console.log('Finished: audio output closed.');
function wait(milliseconds) {return new Promise(resolve => setTimeout(resolve, milliseconds));}

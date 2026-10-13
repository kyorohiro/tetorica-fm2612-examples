import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth} from 'tetorica-fm2612/nesapusynth.js';
import {NesApuAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(nes) {
  nes.pulse.setVoice(0, {duty: 0.25, volume: 8});
  nes.pulse.setVoice(1, {duty: 0.5, volume: 5});
  nes.noise.setVoice({volume: 4, period: 6});
  for (const note of ['C4', 'E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4']) {
    nes.pulse.noteOn(0, note);
    nes.pulse.noteOn(1, 'G3');
    nes.triangle.noteOn('C3'); // Triangle has a fixed hardware volume.
    nes.noise.noteOn();
    await wait(40);
    nes.noise.noteOff();
    await wait(160);
    nes.pulse.noteOff(0); nes.pulse.noteOff(1); nes.triangle.noteOff();
    await wait(40);
  }
}

const chip = await createSoundChip('nes');
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

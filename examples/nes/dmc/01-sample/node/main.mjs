import {createSoundChip} from 'tetorica-fm2612';
import {NesApuSynth} from 'tetorica-fm2612/nesapusynth.js';
import {NesApuAudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(nes) {
  // DMC consumes encoded DPCM bytes, not ordinary PCM. No cartridge or ROM needed.
  const bytes = Uint8Array.from({length: 257}, (_, i) => i % 8 < 4 ? 0xff : 0x00);
  await nes.dmc.loadSample(bytes); // Upload completes before playback.
  for (const rate of [8, 12, 15]) {
    nes.dmc.play({rate, loop: true, level: 64});
    await wait(500);
    nes.dmc.stop();
    await wait(100);
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

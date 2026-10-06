import {createSoundChip} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {YM2608Synth} from 'tetorica-fm2612/ym2608synth.js';
import {YM2608AudifyTransport} from 'tetorica-fm2612/node/transports';
import {readFile} from 'node:fs/promises';

async function play(fm) {
  const rhythmRom = new Uint8Array(await readFile(runtimeAssetUrl('tetorica_ym2608_adpcm_rom.bin')));
  // This is Tetorica's original replacement ROM shipped with the package.
  // YM2608 rhythm uses six fixed ADPCM-A voices, not arbitrary sample ranges.
  fm.rhythm.loadRom(rhythmRom);
  fm.rhythm.setVolume(45);
  for (const voice of ['bassDrum', 'snare', 'hiHat']) {
    fm.rhythm.setVoice(voice, {volume: 25, left: true, right: true});
    fm.rhythm.keyOn(voice);
    await wait(200);
    fm.rhythm.keyOff(voice);
    await wait(100);
  }
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

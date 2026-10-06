import {createSoundChip} from 'tetorica-fm2612';
import {YM2608Synth} from 'tetorica-fm2612/ym2608synth.js';
import {YM2608AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  // Original synthetic ADPCM-B: bytes are already encoded, not Float32 PCM.
  // ADPCM-B is a different codec from ADPCM-A and OKIM6258.
  const bytes = Uint8Array.from({length: 1024}, (_, i) => i % 8 < 4 ? 0x55 : 0xdd);
  await fm.adpcm.loadMemory(bytes, 0);
  // Start and exclusive end must both be aligned to 32 bytes.
  fm.adpcm.setSample({start: 0, end: bytes.length});
  fm.adpcm.setPlaybackRate(8000); // Decoded PCM samples/second, not bytes/second.
  fm.adpcm.setVolume(180);
  fm.adpcm.setPan(true, true);
  fm.adpcm.keyOn({repeat: true}); // Repeat the entire selected sample range.
  await wait(600);
  fm.adpcm.keyOff();
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

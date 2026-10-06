import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2608Synth} from 'tetorica-fm2612/ym2608synth.js';
import {YM2608AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(fm) {
  // Original decoded PCM: a 440 Hz sine with 10 ms fades.
  const sourceSampleRate = 8000;
  const sourceFrames = 4000;
  const wave = new Float32Array(sourceFrames);
  for (let i = 0; i < sourceFrames; i++) {
    const fade = Math.min(1, i / 80, (sourceFrames - 1 - i) / 80);
    wave[i] = 0.6 * fade * Math.sin(i * 2 * Math.PI * 440 / sourceSampleRate);
  }

  // loadSample encodes PCM to ADPCM-B, uploads it and selects range/rate.
  // It does not set volume/pan or start playback. Address is 32-byte aligned.
  const pcmSample = await fm.adpcm.loadSample(
    {channels: [wave], sampleRate: sourceSampleRate},
    {address: 0},
  );
  fm.adpcm.setVolume(180);
  fm.adpcm.setPan(true, true);
  fm.adpcm.keyOn();
  await wait(Math.round(((pcmSample.duration + 0.05)) * 1000));
  fm.adpcm.keyOff();

  // A complete WAV file is also accepted. Create one here so no external
  // file is needed; encodeWav() is provided by the npm package.
  const sourceWav = encodeWav({left: wave, right: wave, sampleRate: sourceSampleRate});
  // Reserve another memory range: 4096 does not overlap the first sample.
  const wavSample = await fm.adpcm.loadSample(sourceWav, {address: 4096});
  fm.adpcm.setPlaybackRate(wavSample.sampleRate * 1.5);
  fm.adpcm.keyOn();
  await wait(Math.round(((wavSample.duration / 1.5 + 0.05)) * 1000));
  fm.adpcm.keyOff();
  await wait(100);
  // loadMemory() instead expects already-encoded ADPCM-B, not PCM or WAV.
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

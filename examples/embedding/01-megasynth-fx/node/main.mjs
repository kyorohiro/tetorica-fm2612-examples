import {MegaSynthNode} from 'tetorica-fm2612/node';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';

// Audio generation, nativeFX and device output run inside the owned Worker.
const mega = new MegaSynthNode({masterVolume: 0.25});
try {
  await mega.start();
  await mega.fm.setPreset(0, FM_PRESETS.sine);
  const delay = mega.fx.delay({time: 0.12, feedback: 0.3, mix: 0.25});
  const reverb = mega.fx.reverb({mix: 0.15});
  mega.fx.setChain([delay, reverb]);
  await mega.flush();

  console.log('Playing: YM2612 → native delay → native reverb → speakers');
  for (const fnum of [553, 696, 829]) {
    await mega.fm.noteOn(0, 4, fnum);
    await new Promise(resolve => setTimeout(resolve, 240));
    await mega.fm.noteOff(0);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // Let the effect tails play before draining and stopping the output device.
  await new Promise(resolve => setTimeout(resolve, 600));
  await mega.stop();
} finally {
  await mega.close();
}
console.log('Finished: audio device and Worker closed.');

import {MegaSynthNode} from 'tetorica-fm2612/node';
import {encodeWav} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

// Optional first argument: audify/index.js file URL from another installation.
const synth = new MegaSynthNode({masterVolume: .25, engineOptions: {looperMode: 'pcm'},
  outputOptions: process.argv[2] ? {moduleUrl: process.argv[2]} : {}});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  await synth.start();
  synth.fx.setChain([synth.fx.delay({time: .12, mix: .2}), synth.fx.reverb({mix: .1})]);
  await synth.fm.setPreset(0, FM_PRESETS.sine); await synth.flush();
  console.log('1/4: FM note — recording events');
  await synth.recording.start();
  await synth.fm.noteOn(0, 4, 553); await wait(600); await synth.fm.noteOff(0); await wait(300);
  const recording = await synth.recording.stop();
  const jsonPath = fileURLToPath(new URL('../../../../output/megasynth-realtime-events.json', import.meta.url));
  await mkdir(dirname(jsonPath), {recursive: true});
  await writeFile(jsonPath, JSON.stringify(recording, null, 2));
  await synth.recording.import(JSON.parse(JSON.stringify(recording)));
  console.log('2/4: Replaying event recording');
  await synth.recording.play(null, {loop: true}); await wait(2200);
  await synth.recording.stopPlayback();
  console.log('3/4: Recording a PCM loop, then playing it through nativeFX');
  await synth.looper.start(); await synth.looper.startRecording();
  await synth.looper.noteOn(0, 4, 696); await wait(600); await synth.looper.noteOff(0); await wait(300);
  const unit = await synth.looper.finishRecording();
  await synth.fm.reset(); await wait(3000);
  const dry = await synth.looper.exportAudio(unit.id); // Only explicit export sends PCM to Main.
  const wavPath = fileURLToPath(new URL('../../../../output/megasynth-realtime-pcm.wav', import.meta.url));
  await writeFile(wavPath, encodeWav(dry, {gain: .25}));
  console.log('PCM loop playback state:', await synth.getState());
  console.log('Saved:', jsonPath, wavPath);
  await synth.looper.undo(); await synth.stop();
  console.log('4/4: Resuming after stop — one FM note');
  await synth.resume(); await synth.fm.setPreset(0, FM_PRESETS.sine);
  await synth.fm.noteOn(0, 4, 553); await wait(600); await synth.fm.noteOff(0);
  await synth.stop();
} finally {await synth.close();}
console.log('Finished: audio device and Worker closed.');

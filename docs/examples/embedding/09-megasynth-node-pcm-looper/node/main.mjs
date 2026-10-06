import {createMegaSynthSession} from 'tetorica-fm2612/megasynth_session.js';
import {encodeWav} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const synth = await createMegaSynthSession({sampleRate: 48000, looperMode: 'pcm'});
try {
  synth.fm.setPreset(0, FM_PRESETS.sine);
  synth.fx.setChain([synth.fx.delay({time: .12, mix: .25}), synth.fx.reverb({mix: .15})]);
  await synth.looper.start(); await synth.looper.startRecording();
  synth.looper.noteOn(0, 4, 553); await synth.render(12000);
  synth.looper.noteOff(0); await synth.render(6000);
  const unit = await synth.looper.finishRecording();
  synth.fm.reset(); // Only the captured PCM now plays through nativeFX.
  const dry = await synth.callLooper('exportAudio', [unit.id]);
  const dryPath = fileURLToPath(new URL('../../../../output/megasynth-pcm-dry.wav', import.meta.url));
  await mkdir(dirname(dryPath), {recursive: true});
  await writeFile(dryPath, encodeWav(dry, {gain: .25}));
  const pcm = await synth.render(54000);
  console.log(synth.looper.getState());
  await synth.looper.undo(); await synth.stop();
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../output/09-megasynth-node-pcm-looper.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav(pcm, {gain: .25}));
  console.log(`${output}\n${pcm.left.length} frames · ${pcm.sampleRate} Hz`);
} finally {await synth.close();}

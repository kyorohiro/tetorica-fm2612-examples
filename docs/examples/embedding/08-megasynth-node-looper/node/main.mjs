import {createMegaSynthSession} from 'tetorica-fm2612/megasynth_session.js';
import {encodeWav} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const synth = await createMegaSynthSession({sampleRate: 48000});
try {
  synth.fm.setPreset(0, FM_PRESETS.sine);
  await synth.looper.start(); await synth.looper.startRecording();
  synth.looper.noteOn(0, 4, 553); await synth.render(12000);
  synth.looper.noteOff(0); await synth.render(6000);
  const unit = await synth.looper.finishRecording();
  const pcm = await synth.render(54000);
  console.log(synth.looper.getState());
  await synth.looper.undo(); await synth.stop();
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../output/08-megasynth-node-looper.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav(pcm, {gain: .25}));
  console.log(`${output}\n${pcm.left.length} frames · ${pcm.sampleRate} Hz`);
} finally {await synth.close();}

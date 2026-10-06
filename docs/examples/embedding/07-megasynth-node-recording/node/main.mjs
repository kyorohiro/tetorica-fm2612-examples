import {createMegaSynthSession} from 'tetorica-fm2612/megasynth_session.js';
import {encodeWav} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const synth = await createMegaSynthSession({sampleRate: 48000});
try {
  synth.fm.setPreset(0, FM_PRESETS.sine);
  synth.recording.start();
  synth.fm.noteOn(0, 4, 553); await synth.render(12000);
  synth.fm.noteOff(0); await synth.render(6000);
  const recording = synth.recording.stop();
  const jsonPath = fileURLToPath(new URL('../../../../output/megasynth-events.json', import.meta.url));
  await mkdir(dirname(jsonPath), {recursive: true});
  await writeFile(jsonPath, JSON.stringify(recording, null, 2));
  synth.recording.import(JSON.parse(JSON.stringify(recording)));
  synth.recording.play(null, {loop: true});
  const pcm = await synth.render(54000);
  synth.recording.stopPlayback();
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../output/07-megasynth-node-recording.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav(pcm, {gain: .25}));
  console.log(`${output}\n${pcm.left.length} frames · ${pcm.sampleRate} Hz`);
} finally {await synth.close();}

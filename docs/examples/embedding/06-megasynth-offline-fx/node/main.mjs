import {createMegaSynthOffline} from 'tetorica-fm2612/megasynth_offline.js';
import {encodeWav} from 'tetorica-fm2612';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const synth = await createMegaSynthOffline({sampleRate: 48000});
try {
  synth.fm.setPreset(0, FM_PRESETS.sine);
  synth.fx.setChain([synth.fx.delay({time: .12, mix: .25}), synth.fx.reverb({mix: .15})]);
  synth.schedule(0, {target: 'fm', method: 'noteOn', args: [0, 4, 553]});
  synth.schedule(12000, {target: 'fm', method: 'noteOff', args: [0]});
  const pcm = synth.render(48000);
  const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../../../../output/06-megasynth-offline-fx.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav(pcm, {gain: .25}));
  console.log(`${output}\n${pcm.left.length} frames · ${pcm.sampleRate} Hz`);
} finally {synth.close();}

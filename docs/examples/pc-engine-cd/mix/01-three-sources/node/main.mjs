// Node.js 22+: actual HuC6280 + MSM5205 + CD-DA on one offline output clock.
import {encodeWav} from 'tetorica-fm2612';
import {runtimeAssetUrl} from 'tetorica-fm2612/assets';
import {createCddaOffline} from 'tetorica-fm2612/cdda_offline.js';
import {createMSM5205PCM} from 'tetorica-fm2612/msm5205_pcm.js';
import {prepareMSM5205Sample} from 'tetorica-fm2612/msm5205_sample.js';
import {Huc6280AudioEngine} from 'tetorica-fm2612/huc6280audioengine.js';
import {Huc6280Synth, Huc6280DirectTransport, HUC6280_CLOCK} from 'tetorica-fm2612/huc6280synth.js';
import hucFactory from 'tetorica-fm2612/generated/huc6280_wasm.js';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const OUTPUT_RATE = 48000, OUTPUT_GAIN = 0.5;
let psg, pce, adpcm, offline;
try {
  const [hucBinary, adpcmBinary] = await Promise.all([
    readFile(runtimeAssetUrl('generated/huc6280_wasm.wasm')),
    readFile(runtimeAssetUrl('generated/msm5205_wasm.wasm')),
  ]);
  psg = await Huc6280AudioEngine.create({moduleFactory: () => hucFactory({wasmBinary: hucBinary}),
    clock: HUC6280_CLOCK, outputSampleRate: OUTPUT_RATE, masterVolume: 1});
  pce = new Huc6280Synth({transport: new Huc6280DirectTransport(psg), clock: HUC6280_CLOCK});
  pce.initialize();
  pce.setWaveform(0, Array.from({length: 32}, (_, i) => Math.round(15.5 + 15.5 * Math.sin(i * Math.PI / 16))));
  pce.setVolume(0, 26); pce.setPan(0, 15, 15);

  const mono = new Float32Array(4000); // Half-second original 880 Hz, encoded at rate 12 / 8 kHz.
  for (let i = 0; i < mono.length; ++i) {
    const fade = Math.min(1, i / 200, (mono.length - 1 - i) / 200);
    mono[i] = Math.sin(2 * Math.PI * 880 * i / 8000) * 0.16 * fade;
  }
  const prepared = await prepareMSM5205Sample({sampleRate: 8000, channels: [mono]}, {rate: 12});
  adpcm = await createMSM5205PCM({sampleRate: OUTPUT_RATE, wasmBinary: adpcmBinary});
  adpcm.prepare(prepared.data);
  adpcm.stop(); // Explicitly retain a silent RAM driver before its scheduled play.
  const adpcmSource = {sampleRate: OUTPUT_RATE, processFrames(frames) {
    const left = new Float32Array(frames), right = new Float32Array(frames);
    adpcm.render(left, right); return {left, right};
  }};
  // Each core stays at unity. These explicit instructional strip settings are
  // applied once by the offline mixer; OUTPUT_GAIN is applied once at encoding.
  offline = await createCddaOffline({sampleRate: OUTPUT_RATE, sources: [
    {engine: psg, volume: 0.44, pan: 0.2},
    {engine: adpcmSource, volume: 0.7, pan: -0.3},
  ]});
  const sourceRate = 44100, sourceFrames = Math.round(3.2 * sourceRate);
  const left = new Float32Array(sourceFrames), right = new Float32Array(sourceFrames);
  for (let i = 0; i < sourceFrames; ++i) {
    const fade = Math.min(1, i / (0.02 * sourceRate), (sourceFrames - 1 - i) / (0.02 * sourceRate));
    left[i] = Math.sin(2 * Math.PI * 220 * i / sourceRate) * 0.08 * fade;
    right[i] = Math.sin(2 * Math.PI * 330 * i / sourceRate) * 0.08 * fade;
  }
  await offline.cdda.load(encodeWav({left, right, sampleRate: sourceRate}));
  await offline.cdda.play();
  console.log('PHASE_MIX_CDDA_ONLY 0.0–0.6 s · L220 / R330 Hz');
  offline.schedule(Math.round(0.6 * OUTPUT_RATE), () => {
    console.log('PHASE_MIX_PSG_ONLY 0.6–1.2 s · A4 / 440 Hz');
    pce.noteOn(0, 'A4');
  });
  await offline.mix({mute: true}, {at: 0.6}); // Muted CD-DA still advances its source clock.
  offline.schedule(Math.round(1.2 * OUTPUT_RATE), () => {
    console.log('PHASE_MIX_ADPCM_ONLY 1.2–1.8 s · 880 Hz');
    pce.keyOff(0); adpcm.play({length: prepared.frames, rate: prepared.rate, loop: true});
  });
  offline.schedule(Math.round(1.8 * OUTPUT_RATE), () => {
    console.log('PHASE_MIX_ALL 1.8–2.8 s · three actual cores'); pce.noteOn(0, 'A4');
  });
  await offline.mix({mute: false}, {at: 1.8});
  offline.schedule(Math.round(2.8 * OUTPUT_RATE), () => {
    console.log('PHASE_MIX_STOP 2.8–3.0 s'); pce.allNotesOff(); adpcm.stop();
  });
  offline.schedule(Math.round(2.8 * OUTPUT_RATE), {type: 'stop'});
  const outputPcm = offline.render(OUTPUT_RATE * 3);
  const output = process.argv[2] ? resolve(process.argv[2])
    : fileURLToPath(new URL('../../../../../output/pc-engine-cd-mix-01-three-sources.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav(outputPcm, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${outputPcm.left.length} frames · 48,000 Hz stereo PCM16 · output gain ${OUTPUT_GAIN} once · no normalization`);
} finally {
  offline?.dispose(); // Borrowed engines remain owned by this script.
  pce?.dispose(); psg?.dispose(); adpcm?.dispose();
}

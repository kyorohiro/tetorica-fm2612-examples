// Node.js 22+: original stereo tracks, decoded only as needed by the C/WASM core.
import {encodeWav} from 'tetorica-fm2612';
import {createCddaOffline} from 'tetorica-fm2612/cdda_offline.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SOURCE_RATE = 44100, OUTPUT_RATE = 48000, OUTPUT_GAIN = 0.5;
const TRACK_FRAMES = Math.round(1.2 * SOURCE_RATE);
const left = new Float32Array(TRACK_FRAMES * 2), right = new Float32Array(left.length);
for (let track = 0; track < 2; ++track) {
  const [leftHz, rightHz] = track ? [440, 660] : [220, 330];
  for (let i = 0; i < TRACK_FRAMES; ++i) {
    const fade = Math.min(1, i / (0.02 * SOURCE_RATE), (TRACK_FRAMES - 1 - i) / (0.02 * SOURCE_RATE));
    left[track * TRACK_FRAMES + i] = Math.sin(2 * Math.PI * leftHz * i / SOURCE_RATE) * 0.16 * fade;
    right[track * TRACK_FRAMES + i] = Math.sin(2 * Math.PI * rightHz * i / SOURCE_RATE) * 0.16 * fade;
  }
}
const wav = encodeWav({left, right, sampleRate: SOURCE_RATE});
const disc = {tracks: [
  {number: 2, file: '/generated/stereo.wav', title: 'Original 220 / 330 Hz', startFrame: 0, endFrame: TRACK_FRAMES},
  {number: 3, file: '/generated/stereo.wav', title: 'Original 440 / 660 Hz', startFrame: TRACK_FRAMES, endFrame: TRACK_FRAMES * 2},
]};
const offline = await createCddaOffline({sampleRate: OUTPUT_RATE, readFile: async name => {
  if (name !== '/generated/stereo.wav') throw new Error('Unknown generated track: ' + name);
  return wav;
}});
try {
  const chunks = [];
  const render = seconds => chunks.push(offline.render(Math.round(seconds * OUTPUT_RATE)));
  await offline.cdda.load(disc);
  console.log('PHASE_CDDA_PLAY track 2 · 0.0–0.6 s');
  await offline.cdda.play(2); render(0.6);
  console.log('PHASE_CDDA_PAUSE 0.6–0.8 s');
  await offline.cdda.pause(); render(0.2);
  console.log('PHASE_CDDA_RESUME 0.8–1.2 s');
  await offline.cdda.resume(); render(0.4);
  console.log('PHASE_CDDA_SEEK source 0.2 s · output 1.2–1.6 s');
  await offline.cdda.seek(0.2); render(0.4);
  console.log('PHASE_CDDA_TRACK track 3 · 1.6–2.8 s');
  await offline.cdda.play(3); render(1.2);
  if ((await offline.cdda.getState()).state !== 'ended') throw new Error('Track 3 did not end at its source boundary');
  console.log('PHASE_CDDA_EOF 2.8–3.0 s'); render(0.2);
  console.log('PHASE_CDDA_REPLAY track 2, source 0.25 s · output 3.0–3.4 s');
  await offline.cdda.play(2, {offset: 0.25}); render(0.4);
  console.log('PHASE_CDDA_STOP 3.4–3.6 s');
  await offline.cdda.stop(); render(0.2);

  const frames = chunks.reduce((sum, chunk) => sum + chunk.left.length, 0);
  const outputLeft = new Float32Array(frames), outputRight = new Float32Array(frames);
  let offset = 0;
  for (const chunk of chunks) {outputLeft.set(chunk.left, offset); outputRight.set(chunk.right, offset); offset += chunk.left.length;}
  const output = process.argv[2] ? resolve(process.argv[2])
    : fileURLToPath(new URL('../../../../../output/pc-engine-cd-cdda-01-stereo-tracks.wav', import.meta.url));
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, encodeWav({left: outputLeft, right: outputRight, sampleRate: OUTPUT_RATE}, {gain: OUTPUT_GAIN}));
  console.log(`${output}\n${frames} frames · 48,000 Hz stereo PCM16 · output gain ${OUTPUT_GAIN} once · no normalization`);
} finally {offline.dispose();}

// Run this file from the repository root with Node.js 22+.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2612Synth, YM2612DirectTransport} from 'tetorica-fm2612/ym2612synth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ym2612');
try {
  const sampleRate = chip.sampleRate();
  const transport = new YM2612DirectTransport(chip);
  const fm = new YM2612Synth({transport});
  const segments = [];
  fm.setAlgo(0, 7, 0);
  fm.setPan(0, true, true);
  for (let operator = 0; operator < 4; operator++) {
    fm.setOperator(0, operator, {
      dt: 0, multi: 1, tl: operator === 3 ? 8 : 127,
      ar: 22, d1r: 6, d2r: 3, sl: 3, rr: 8,
    });
  }
  fm.noteOn(0, 4, 553);
  segments.push(transport.generateStereo(Math.round(sampleRate * 0.6)));
  fm.noteOff(0);
  segments.push(transport.generateStereo(Math.round(sampleRate * 0.3)));
  // Concatenate the generated segments in their original order.
  const frames = segments.reduce((sum, segment) => sum + segment.left.length, 0);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let offset = 0;
  for (const segment of segments) {
    left.set(segment.left, offset);
    right.set(segment.right, offset);
    offset += segment.left.length;
  }

  // Encode and save stereo PCM16. No audio driver is required.
  const wav = encodeWav({left, right, sampleRate}, {gain: 0.25});
  const defaultPath = fileURLToPath(new URL('../../../../../output/genesis-fm-04-operators.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

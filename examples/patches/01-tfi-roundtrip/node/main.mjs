// Run this file from the repository root with Node.js 22+.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {YM2612Synth, YM2612DirectTransport} from 'tetorica-fm2612/ym2612synth.js';
import {createTfiFromPreset, parseTfi} from 'tetorica-fm2612/tfi.js';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ym2612');
try {
  const sampleRate = chip.sampleRate();
  const transport = new YM2612DirectTransport(chip);
  const fm = new YM2612Synth({transport});
  const segments = [];
  const preset = {
    algorithm: 7, feedback: 0, pan: {left: true, right: true},
    operators: {
      1: {multi: 1, tl: 127, ar: 31, rr: 15},
      2: {multi: 1, tl: 127, ar: 31, rr: 15},
      3: {multi: 1, tl: 127, ar: 31, rr: 15},
      4: {multi: 1, tl: 8, ar: 31, rr: 15},
    },
  };
  const patchBytes = process.argv[2] ? await readFile(resolve(process.argv[2])) : createTfiFromPreset(preset);
  const imported = parseTfi(patchBytes);
  fm.setPreset(0, imported);
  const exported = createTfiFromPreset(imported);
  fm.noteOn(0, 4, 553); // channel, block, F-number
  segments.push(transport.generateStereo(Math.round(sampleRate * 0.6)));
  fm.noteOff(0);
  segments.push(transport.generateStereo(Math.round(sampleRate * 0.2)));
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
  const defaultPath = fileURLToPath(new URL('../../../../output/patches-01-tfi-roundtrip.wav', import.meta.url));
  const output = process.argv[3] ? resolve(process.argv[3]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  await writeFile(output + '.tfi', exported);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

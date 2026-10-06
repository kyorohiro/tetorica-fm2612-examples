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
  for (const name of ['sine', 'two-op-bell', 'two-op-organ']) {
    fm.setPreset(0, FM_PRESETS[name]);
    fm.noteOn(0, 4, 553);
    segments.push(transport.generateStereo(Math.round(sampleRate * 0.5)));
    fm.noteOff(0);
    segments.push(transport.generateStereo(Math.round(sampleRate * 0.25)));
  }
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
  const defaultPath = fileURLToPath(new URL('../../../../../output/genesis-fm-03-presets.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

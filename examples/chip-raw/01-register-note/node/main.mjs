// Run this file from the repository root with Node.js 22+.
import {createSoundChip, encodeWav} from 'tetorica-fm2612';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const chip = await createSoundChip('ym2612');
try {
  const sampleRate = chip.sampleRate();
  const segments = [];
  // writeRegister(address, value, port): channel 0, port 0.
  for (const address of [0x40, 0x44, 0x48]) chip.writeRegister(address, 127, 0);
  chip.writeRegister(0x3c, 1, 0);    // OP4: multiplier 1
  chip.writeRegister(0x4c, 8, 0);    // OP4: total level
  chip.writeRegister(0x5c, 31, 0);   // attack
  chip.writeRegister(0x6c, 0, 0);    // decay
  chip.writeRegister(0x7c, 0, 0);    // sustain rate
  chip.writeRegister(0x8c, 15, 0);   // release
  chip.writeRegister(0xb0, 7, 0);    // algorithm 7
  chip.writeRegister(0xb4, 0xc0, 0); // left + right
  chip.writeRegister(0xa4, (4 << 3) | (553 >> 8), 0);
  chip.writeRegister(0xa0, 553 & 0xff, 0);
  chip.writeRegister(0x28, 0xf0, 0);  // key on
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.6)));
  chip.writeRegister(0x28, 0x00, 0);  // key off
  segments.push(chip.generateStereo(Math.round(sampleRate * 0.2)));
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
  const defaultPath = fileURLToPath(new URL('../../../../output/chip-raw-01-register-note.wav', import.meta.url));
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultPath;
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, wav);
  console.log(`${output}\n${left.length} frames · ${sampleRate} Hz · stereo PCM16`);
} finally {
  chip.dispose();
}

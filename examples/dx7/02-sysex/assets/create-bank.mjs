// Original simple voices for this example, not factory/third-party presets.
// DX7 VMEM: 32 x 128-byte packed voices, algorithm 32 (parallel carriers).
// Run from any directory: node examples/dx7/02-sysex/assets/create-bank.mjs
import {writeFile} from 'node:fs/promises';

const payload = new Uint8Array(32 * 128);
for (let index = 0; index < 32; index++) {
  const voice = payload.subarray(index * 128, (index + 1) * 128);
  for (let operator = 0; operator < 6; operator++) { // Wire order OP6 .. OP1.
    const offset = operator * 17;
    voice.set([99, 99, 99, 70, 99, 99, 99, 0], offset); // EG rates / levels.
    voice[offset + 12] = 7 << 3; // Neutral detune, rate scaling 0.
    voice[offset + 14] = operator === 5 ? 99 : 0; // Only OP1 is audible.
    voice[offset + 15] = 1 << 1; // Ratio mode, coarse 1, fine 0.
  }
  if (index < 16) {
    voice[5 * 17 + 15] = (1 + index % 4) << 1;
    voice[5 * 17 + 16] = Math.floor(index / 4) * 25;
  } else {
    voice[4 * 17 + 14] = 85; // Add OP2 as a quiet parallel harmonic.
    voice[4 * 17 + 15] = (2 + (index - 16) % 8) << 1;
    voice[4 * 17 + 16] = index < 24 ? 0 : 50;
  }
  voice.fill(99, 102, 106); // Pitch EG rates.
  voice.fill(50, 106, 110); // Neutral pitch EG levels.
  voice[110] = 31; // Algorithm 32, zero-based.
  voice[111] = 8; // Oscillator sync ON, feedback 0.
  voice[117] = 24; // Transpose neutral.
  const name = (index < 16 ? 'SINE ' : 'HARM ') + String(index % 16 + 1).padStart(2, '0');
  voice.fill(32, 118, 128);
  voice.set(new TextEncoder().encode(name), 118);
}
const bytes = new Uint8Array(4104);
bytes.set([0xf0, 0x43, 0, 9, 32, 0]); // 4096-byte DX7 bulk dump, channel 0.
bytes.set(payload, 6);
bytes[4102] = (-payload.reduce((sum, byte) => sum + byte, 0)) & 127;
bytes[4103] = 0xf7;
await writeFile(new URL('./original-bank.syx', import.meta.url), bytes);
console.log('Wrote original-bank.syx: 32 original voices, 4104 bytes.');

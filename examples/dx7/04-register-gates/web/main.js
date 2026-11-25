import {setupPlayer} from '../../player.js';

setupPlayer("FM21290：レジスタで2声を演奏", `const chip = await useSoundChip('fm21290');
setBpm(96);
chip.writeRegister(0x2804, 0x30); // Apply algorithm to all slots; oscillator sync.
chip.writeRegister(0x2805, 0);
chip.writeRegister(0x302a, 0x23); // OP1 frequency ratio 1.
chip.writeRegister(0x302b, 0x2c);
for (let stage = 0; stage < 4; stage++) {
  chip.writeRegister(0x3054 + stage, 63);
  chip.writeRegister(0x3074 + stage, stage === 3 ? 63 : 0);
}
function keyOn(slot, pitch) {
  chip.writeRegister(0x3000 + 2 * slot, pitch >> 8);
  chip.writeRegister(0x3001 + 2 * slot, pitch & 255);
  chip.writeRegister(0x30d0 + slot, 15); // OP1 output attenuation.
  chip.writeRegister(0x30f1, (slot << 2) | 1);
}
function keyOff(slot) {
  chip.writeRegister(0x30f1, (slot << 2) | 2);
}
keyOn(0, 0x5aa8); // A4
await beat(1);
keyOn(1, 0x63fd); // E5
await beat(1);
keyOff(0);
await beat(1);
keyOff(1);
await beat(1);`);

// Original demonstration data. No game music, Nintendo IPL ROM or external assets.
// Run this file again to reproduce original.spc byte for byte.
import {writeFile} from 'node:fs/promises';

const bytes = new Uint8Array(0x10200);
bytes.set(new TextEncoder().encode('SNES-SPC700 Sound File Data v0.30'));
bytes.set([0x1a, 0x1a, 0x1b, 30], 0x21); // No ID666 metadata.
bytes.set([0x00, 0x02, 0, 0, 0, 0, 0xef], 0x25); // PC=$0200; SP=$ef.
const ram = bytes.subarray(0x100, 0x10100);
ram.set([0xab, 0x30, 0x2f, 0xfc], 0x200); // INC $30; BRA $0200.
ram[0xf1] = 0; // IPL mapping off; no ROM boot sequence.
ram.set([0x00, 0x20, 0x00, 0x20], 0x1000); // BRR start and loop at $2000.
ram.set([0xc3, 0x13, 0x57, 0x75, 0x31, 0xfd, 0xb9, 0x9b, 0xdf], 0x2000);
const dsp = bytes.subarray(0x10100, 0x10180);
dsp[0x00] = 64; // Voice 0 left volume.
dsp[0x01] = 48; // Voice 0 right volume.
dsp[0x02] = 0;
dsp[0x03] = 0x10; // PITCH=$1000: native BRR playback rate.
dsp[0x07] = 0x7f; // Direct gain, ADSR disabled.
dsp[0x0c] = dsp[0x1c] = 0x7f; // Master volume.
dsp[0x4c] = 1; // Key on voice 0.
dsp[0x5d] = 0x10; // Source directory at $1000.
dsp[0x6c] = 0x20; // Echo RAM writes disabled.
await writeFile(new URL('./original.spc', import.meta.url), bytes);
console.log(`Created original.spc (${bytes.length} bytes): authored looping 2000 Hz tone.`);

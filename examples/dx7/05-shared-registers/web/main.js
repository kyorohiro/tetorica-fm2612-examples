import {setupPlayer} from '../../player.js';

setupPlayer("DX7：押鍵したままレジスタで音量を変える", `const dx7 = await useSoundChip('dx7');
const chip = await useSoundChip('fm21290');
setBpm(96);
await dx7.setPreset({algorithm: 31, operators: {1: {outputLevel: 99}}});
dx7.noteOn(69, 100);
await beat(1);
chip.writeRegister(0x30d0, 95); // CH1 OP1 attenuation: quieter.
await beat(1);
chip.writeRegister(0x30d0, 15); // Restore the level on the same held note.
await beat(1);
dx7.noteOff(69);
await beat(1);`);

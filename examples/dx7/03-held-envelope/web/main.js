import {setupPlayer} from '../../player.js';

setupPlayer("DX7：押鍵中のエンベロープ編集", `setBpm(90);
const dx7 = await useSoundChip('dx7');
await dx7.setPreset({
  algorithm: 31,
  operators: {1: {coarse: 1, outputLevel: 90,
    envelope: {rates: [99,99,99,0], levels: [99,99,99,0]}}},
});

dx7.noteOn(69, 100);
await beat(1);
await dx7.setOperator(1, {envelope: {levels: [99,99,30,0]}});
await beat(1);
await dx7.setOperator(1, {envelope: {levels: [99,99,99,0]}});
await beat(1);
dx7.noteOff(69);
await beat(1); // R4 = 0 keeps the release slow.
await dx7.setOperator(1, {envelope: {rates: [99,99,99,99]}});
await beat(1);`);

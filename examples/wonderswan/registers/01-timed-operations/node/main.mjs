// SPDX-License-Identifier: BSD-3-Clause
// Offline compilation: no WASM, AudioContext or native device.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {buildWonderSwanOperations as build, compileWonderSwanOperations as compile,
  createWonderSwanOperationResetState} from 'tetorica-fm2612/wonderswan_operations.js';
const state = createWonderSwanOperationResetState();
state.registers[0x10] = 2; // Another writer already enabled physical CH2.
const before = JSON.stringify(state);
const a = build(b => {
  b.setPan(0, 12, 0).keyOn(0);
  b.atSample(4410).setNoise({enabled:true,type:3,reset:true});
  b.atSeconds(0.1).setNoise({enabled:true,type:3,reset:true});
  b.atSeconds(0.75).keyOff(0);
});
const b = build(recorder => recorder.setPan(0, 0, 12).keyOn(0));
const writesA = compile(a, state), writesB = compile(b, state);
assert.equal(JSON.stringify(state), before);
assert.equal(writesA[0].value, 0xc0); assert.equal(writesB[0].value, 0x0c);
const controls = writesA.filter(w => w.register === 0x90);
assert(controls.every(w => w.value & 2), 'R90 preserves the other Gate');
assert.equal(controls.at(-1).value & 1, 0);
const triggers = writesA.filter(w => w.register === 0x8e);
assert.equal(triggers.length, 2); assert.equal(triggers[0].value, triggers[1].value);
assert.equal(triggers[0].offsetSeconds, 0.1); assert.equal(triggers[1].offsetSeconds, 0.1);
assert(triggers[0].operationIndex < triggers[1].operationIndex);
const report = {format:'tetorica-wonderswan-compile-comparison-v1',passed:true,writesA,writesB,
  checks:{baselineUnchanged:true,manualGatePreserved:true,repeatedTriggerKept:true,sameTimeOrder:true}};
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report,null,2)+'\n');
console.table(writesA); console.log('PASS WonderSwan compile comparison (no audio device)');

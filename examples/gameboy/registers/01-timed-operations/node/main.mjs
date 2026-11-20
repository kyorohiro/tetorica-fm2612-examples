// SPDX-License-Identifier: BSD-3-Clause
// Offline register inspection: a virtual transport, no WASM or audio device.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {buildGameboyOperations as build, compileGameboyOperations as compile,
  createGameboyOperationResetState} from 'tetorica-fm2612/gameboy_operations.js';
import {createGameboyTimedSnapshot} from 'tetorica-fm2612/gameboy_timed_state.js';

let sent = 0;
const virtual = new GameboySynth({transport:{writeRegister(){sent++;},reset(){sent++;}}});
virtual.initialize();
virtual.writeRegister(1, 0x1f); // NR11 lower length bits must survive a Duty edit.
virtual.writeRegister(21, 0x22); // Another channel already has left/right routing.
const snapshot = createGameboyTimedSnapshot(virtual._getState(), {
  instanceId:'offline-dmg-comparison', frame:0, sampleRate:48000,
});
const before = JSON.stringify(snapshot), count = sent;
let builds = 0;
const a = build(b => {
  builds++;
  b.pulse.setDuty(0, .25).setPan(0, true, false);
  b.pulse.setEnvelope(0, {volume:9, direction:'down', period:0});
  b.pulse.setNote(0, 'E4').pulse.keyOn(0).pulse.keyOn(0);
  b.atSample(4410).pulse.keyOff(0);
  b.atSeconds(.2).pulse.keyOn(0); // Restore its configured volume after keyOff.
});
const b = build(recorder => recorder.pulse.setDuty(0, .75).setPan(0, false, true));
const writesA = compile(a, snapshot.state), writesB = compile(b, snapshot.state);
assert.equal(builds, 1);
assert.deepEqual(compile(a, snapshot.state), writesA, 'One snapshot can be reused');
assert.equal(writesA[0].value, 0x5f); assert.equal(writesB[0].value, 0xdf);
assert.equal(writesA[1].value, 0x32); assert.equal(writesB[1].value, 0x23);
const triggers = writesA.filter(row => row.register === 4 && row.value & 128);
assert.equal(triggers.length, 3);
assert.equal(triggers[0].value, triggers[1].value, 'Repeated same-time trigger writes remain visible');
assert.equal(triggers[0].offsetSeconds, 0); assert.equal(triggers[1].offsetSeconds, 0);
assert(triggers[0].operationIndex < triggers[1].operationIndex);
assert.equal(triggers[2].offsetSeconds, .2);
assert(writesA.some(row => row.register === 2 && row.offsetSeconds === .1 && row.value === 0));
assert(writesA.some(row => row.register === 2 && row.offsetSeconds === .2 && row.value === 0x90));

const triangle = Array.from({length:32}, (_, i) => i < 16 ? i : 31 - i);
const waveWrites = compile(build(recorder => {
  recorder.wave.stopAndSetWaveform(triangle).wave.setLevel(.25).wave.noteOn('C3');
  recorder.atSeconds(.6).wave.keyOff();
}), snapshot.state);
assert.deepEqual([waveWrites[0].register,waveWrites[0].value],[10,0], 'Wave upload first stops CH3 DAC');
assert.equal(waveWrites.filter(row => row.register >= 32 && row.register <= 47).length,16);
assert(waveWrites.findIndex(row => row.register === 14 && row.value & 128) >
  waveWrites.findIndex(row => row.register === 47), 'Wave trigger follows the packed Wave RAM writes');
const noiseWrites = compile(build(recorder => {
  recorder.noise.setEnvelope({volume:6, direction:'down', period:1});
  recorder.noise.setParameters({divisor:3, shift:4, width:15}).noise.keyOn();
  recorder.atSeconds(.0625).noise.setParameters({shift:2, width:7});
  recorder.atSeconds(.125).noise.keyOff();
}), snapshot.state);
assert(noiseWrites.some(row => row.register === 18 && row.offsetSeconds === .0625 && row.value === 0x2b));

// The actual hardware reset baseline is uninitialized and contributes no writes.
const reset = createGameboyOperationResetState();
const resetWrites = compile(build(recorder => {
  recorder.writeRegister(22,0x80); recorder.writeRegister(20,0x77);
}),reset);
assert.equal(reset.initialized,false);assert.equal(reset.registers[22],0);
assert.equal(resetWrites.length,2);
assert.equal(JSON.stringify(snapshot), before);
assert.equal(sent,count,'Compilation never writes to even the virtual live transport');
const report = {format:'tetorica-dmg-compile-comparison-v1',passed:true,writesA,writesB,waveWrites,noiseWrites,resetWrites,
  checks:{buildOnce:true,baselineUnchanged:true,liveTransportUnchanged:true,reusedSnapshot:true,
    packedFieldsPreserved:true,repeatedTriggerKept:true,keyOffRetainsVoice:true,waveUploadBeforeTrigger:true}};
if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.table(writesA);console.table(waveWrites);console.table(noiseWrites);
console.log('PASS DMG compile comparison (no audio device)');

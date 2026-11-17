// SPDX-License-Identifier: BSD-3-Clause
// Published npm only. No WASM, AudioContext, native output or device is opened.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {YM2612Synth} from 'tetorica-fm2612/ym2612synth.js';
import {attachYm2612TimedClient} from 'tetorica-fm2612/ym2612_timed_client.js';
import {createYm2612OperationResetState, observeYm2612OperationWrite} from 'tetorica-fm2612/ym2612_operations.js';
import {createYm2612TimedSnapshot} from 'tetorica-fm2612/ym2612_timed_state.js';

// This transport records authoring writes, rather than sending them to a chip.
// Its independently owned shadow is an explicit, known offline baseline.
let state = createYm2612OperationResetState();
const sent = [];
const fm = attachYm2612TimedClient(new YM2612Synth({transport: {
  reset() {state = createYm2612OperationResetState();},
  write({port, register, value}) {
    sent.push({port, register, value});
    observeYm2612OperationWrite(state, port, register, value);
  },
}}), {native:true, instanceId:'offline-register-recorder', engine:'ymfm'});

try {
  fm.setOperator(0, 0, {dt:3, multi:1}); // R30 = 0x31.
  // Metadata is authored locally. This is NOT an AudioWorklet capture or an
  // oscillator/envelope save state. The browser example makes a real capture.
  const snapshot = createYm2612TimedSnapshot(state, {
    instanceId:'offline-register-recorder', clock:fm.clock, engine:'ymfm',
    frame:0, sampleRate:44100,
  });
  const saved = JSON.stringify(snapshot);
  fm.setOperator(0, 0, {dt:7}); // Local client now has DT7; snapshot still has DT3.

  const operations = fm.build(b => {
    b.atSample(0).setOperator(0, 0, {multi:2}); // Keep each baseline's DT.
    b.atSeconds(0.1).keyOn(0);
    b.keyOn(0); // A repeated trigger write is deliberately preserved.
    b.atSample(8820).keyOff(0); // 0.2 seconds at the default 44100 Hz reference.
  });
  const otherOperations = fm.build(b => b.setOperator(0, 0, {dt:1}));
  const before = JSON.stringify(state), sentBefore = sent.length;
  const client = await fm.compile(operations, {initialState:'client'});
  const reset = await fm.compile(operations, {initialState:'reset'});
  const snapshotA = await fm.compile(operations, {initialState:snapshot});
  const again = await fm.compile(operations, {initialState:snapshot});
  const snapshotB = await fm.compile(otherOperations, {initialState:snapshot});

  // No authoritative renderer exists here. Never silently emulate it with a
  // JavaScript timer or label local bytes as the live sound chip's state.
  const errors = {};
  for (const [name, operation] of Object.entries({
    capture:() => fm.captureState(),
    current:() => fm.compile(operations),
    schedule:() => fm.schedule(operations, {name:'offline-example'}),
  })) {
    try {await operation(); throw Error(`${name} unexpectedly succeeded`);}
    catch (error) {
      assert.match(error.message, /AudioWorklet; Native is not supported/);
      errors[name] = error.message;
    }
  }
  const keys = snapshotA.filter(row => row.register === 0x28);
  const checks = {
    clientPreservesDt:client[0].value === 0x72,
    resetStartsAtZero:reset[0].value === 0x02,
    snapshotPreservesDt:snapshotA[0].value === 0x32,
    snapshotReusable:JSON.stringify(snapshotA) === JSON.stringify(again),
    snapshotUnchanged:JSON.stringify(snapshot) === saved && Object.isFrozen(snapshot) && snapshot.registers.every(Object.isFrozen),
    liveStateUnchanged:JSON.stringify(state) === before && sent.length === sentBefore,
    repeatedKeysKept:keys.length === 3 && keys[0].value === 0xf0 && keys[1].value === 0xf0 && keys[2].value === 0,
    mixedTimesPreserved:keys[0].offsetSeconds === 0.1 && keys[1].offsetSeconds === 0.1 && keys[2].offsetSeconds === 0.2,
    independentComparison:snapshotB.length === 1 && snapshotB[0].value === 0x11,
    nativeRejectsLive:Object.keys(errors).length === 3,
  };
  for (const [name, ok] of Object.entries(checks)) assert.equal(ok, true, name);
  const result = {
    format:'tetorica-register-comparison-v1', packageVersion:'0.2.41', chip:'ym2612',
    snapshotOrigin:'Explicit local recording transport; not an AudioWorklet capture.',
    clock:fm.clock, referenceSampleRate:operations.referenceSampleRate,
    baselines:{client, reset, snapshotA, snapshotB}, checks,
    native:{captureSupported:false, scheduleSupported:false, errors}, physicalOutputUsed:false,
  };
  const path = resolve(process.argv[2] ?? 'output/chip-raw-compile-compare.json');
  await mkdir(dirname(path), {recursive:true});
  await writeFile(path, JSON.stringify(result, null, 2) + '\n');
  for (const [name, rows] of Object.entries(result.baselines)) {
    console.log(name); console.table(rows);
  }
  console.log(`Saved register comparison: ${path}`);
} finally {fm.dispose();}

// SPDX-License-Identifier: BSD-3-Clause
// Public npm helpers only: a virtual register transport, no WASM/audio device.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {SidSynth} from 'tetorica-fm2612/sidsynth.js';
import {buildSidOperations, compileSidOperations} from 'tetorica-fm2612/sid_operations.js';
import {createSidTimedSnapshot} from 'tetorica-fm2612/sid_timed_state.js';

const reports=[];
for(const model of ['6581','8580']){
  // Use the ordinary initializer to establish the authoring baseline. This
  // transport collects no sound and creates neither a core nor AudioContext.
  const sid=new SidSynth({model,clock:985248,transport:{writeRegister(){},reset(){}}});
  sid.initialize();
  sid.writeRegister(3,0xa4); // Reserved high bits + Pulse width high nibble.
  sid.writeRegister(4,0x27); // Saw + Gate + Sync + Ring.
  sid.setFilter({mode:'lowpass',routing:1,cutoff:100,resonance:5});
  const state={model,clock:sid.clock,initialized:true,registers:Array.from(sid.getRegisterSnapshot())};
  const snapshot=createSidTimedSnapshot(state,{instanceId:'offline-'+model,frame:0,sampleRate:44100});
  const before=JSON.stringify(snapshot);
  const a=buildSidOperations(b=>{
    b.keyOn(0).keyOn(0); // Same-value event writes remain in order.
    b.atSample(4410).setVoice(0,{waveform:'pulse',pulseWidth:512});
    b.setFilter({cutoff:700});
    b.atSeconds(.2).noteOff(0);
  });
  const b=buildSidOperations(recorder=>recorder.setVoice(0,{waveform:'triangle',pulseWidth:3072}));
  const options={model,clock:state.clock};
  const writesA=compileSidOperations(a,snapshot.state,options);
  const writesB=compileSidOperations(b,snapshot.state,options);
  assert.equal(JSON.stringify(snapshot),before,'snapshot stays unchanged');
  assert.deepEqual(compileSidOperations(a,snapshot.state,options),writesA,'same baseline gives same result');
  assert.deepEqual(writesA.slice(0,2).map(w=>[w.register,w.value]),[[4,0x27],[4,0x27]]);
  assert(writesA[0].operationIndex<writesA[1].operationIndex,'same-time order is retained');
  const controls=writesA.filter(w=>w.register===4);
  assert.equal(controls[2].value,0x47,'Pulse edit retains Gate / Sync / Ring');
  assert.equal(controls.at(-1).value,0x46,'Off changes only Gate');
  assert.equal(writesA.find(w=>w.register===3).value,0xa2,'Pulse width retains reserved bits');
  assert.equal(writesB.find(w=>w.register===3).value,0xac);
  assert.equal(writesB.find(w=>w.register===4).value,0x17,'alternative resolves independently');
  assert.equal(writesA.find(w=>w.register===3).offsetSeconds,.1);
  assert.equal(writesA.at(-1).offsetSeconds,.2);
  assert.deepEqual(sid.getRegisterSnapshot(),Uint8Array.from(state.registers),'compile sends no live writes');
  reports.push({model,writesA,writesB,checks:{snapshotUnchanged:true,repeatable:true,
    packedBitsPreserved:true,repeatedGateKept:true,sameTimeOrder:true,absoluteOffsets:true}});
  console.log('SID '+model+' — program A / program B from one baseline');
  console.table(writesA);console.table(writesB);sid.dispose();
}
const report={format:'tetorica-sid-timed-motion-v1',passed:true,reports};
if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log('PASS SID compile comparison: 6581 / 8580, no audio device or WASM');

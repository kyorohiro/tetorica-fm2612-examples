import {setupPlayer} from '../../player.js';

setupPlayer("DX7", `setBpm(120);
const dx7 = await useSoundChip('dx7');
await mixer.set(dx7.id, {volume: 0.5});

// MIDI note numbers: C4, E4, G4, C5. Velocity is 0..127.
for (const note of [60, 64, 67, 72]) {
  dx7.noteOn(note, 100);
  await beat(0.75);
  dx7.noteOff(note);
  await beat(0.25);
}

// Hold a C-major chord for two beats.
for (const note of [60, 64, 67]) dx7.noteOn(note, 100);
await beat(2);
dx7.allNotesOff();
// Let the INIT SINE release tail finish before the host closes audio.
await beat(1);`);

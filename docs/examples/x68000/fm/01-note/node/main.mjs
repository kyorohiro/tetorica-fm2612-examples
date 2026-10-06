import {createSoundChip} from 'tetorica-fm2612';
import {YM2151AudifyTransport} from 'tetorica-fm2612/node/transports';

async function play(transport) {
  transport.reset();
  transport.write(0, 0x20);
  transport.write(1, 0xc7); // Both outputs, algorithm 7, feedback 0.
  for (let operator = 0; operator < 4; operator++) {
    const offset = operator * 8;
    transport.write(0, 0x40 + offset);
    transport.write(1, 1); // Multiplier 1, detune 0.
    transport.write(0, 0x60 + offset);
    transport.write(1, operator === 3 ? 24 : 127);
    transport.write(0, 0x80 + offset);
    transport.write(1, 31); // Attack.
    transport.write(0, 0xa0 + offset);
    transport.write(1, 0);  // First decay.
    transport.write(0, 0xc0 + offset);
    transport.write(1, 0);  // Second decay / detune 2.
    transport.write(0, 0xe0 + offset);
    transport.write(1, 15); // Sustain level 0, release 15.
  }
  transport.write(0, 0x28);
  transport.write(1, 0x4a); // Key code: octave and semitone bits.
  transport.write(0, 0x30);
  transport.write(1, 0);    // Key fraction 0.
  transport.write(0, 0x08);
  transport.write(1, 0x40); // Key on C2 (operator 3), channel 0.
  await wait(600);
  transport.write(0, 0x08);
  transport.write(1, 0);    // Key off channel 0.
  await wait(200);
}

const chip = await createSoundChip('ym2151');
const transport = new YM2151AudifyTransport(chip);
try {
  await transport.start();
  console.log('Playing…');
  await play(transport);
  await transport.stop();
} finally {
  await transport.close(); chip.dispose();
}
console.log('Finished: audio output closed.');
function wait(milliseconds) {return new Promise(resolve => setTimeout(resolve, milliseconds));}

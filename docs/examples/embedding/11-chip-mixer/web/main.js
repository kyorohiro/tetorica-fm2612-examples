import {createSoundChip, SoundChipMixer} from 'tetorica-fm2612';
import {GameboySynth} from 'tetorica-fm2612/gameboysynth.js';
import {GameboyWorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const status = document.getElementById('status');
const strips = document.getElementById('strips');
const detail = document.getElementById('detail');
let controller;

function wait(milliseconds, {signal}) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    function abort() {clearTimeout(timer); reject(signal.reason);}
    signal.addEventListener('abort', abort, {once: true});
  });
}

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Loading…';
  strips.replaceChildren();
  const mixer = new SoundChipMixer();
  const chips = [];
  const transports = [];
  let context;
  try {
    context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0.4;
    master.connect(context.destination);
    // Both outputs share a mixer and AudioContext. IDs are allocated automatically.
    for (let i = 0; i < 2; i++) {
      const chip = await createSoundChip('gameboy', {
        execution: 'worklet', mixer, audioContext: context, outputNode: master, gain: 1, signal,
      });
      chips.push(chip);
      signal.throwIfAborted();
      const transport = new GameboyWorkletTransport(chip);
      transports.push(transport);
      await transport.start();
      addStrip(chip, mixer);
    }
    resetButton.disabled = false;
    resetButton.onclick = () => {mixer.reset(); refresh();};
    const synths = transports.map(transport => new GameboySynth({transport}));
    for (const gb of synths) {
      gb.initialize();
      gb.pulse.setVoice(0, {duty: 0.5, volume: 8, envelope: {direction: 'down', period: 0}});
    }
    status.textContent = 'Playing…';
    for (const notes of [['C4', 'E4'], ['D4', 'F4'], ['E4', 'G4'], ['C4', 'G4']]) {
      synths.forEach((gb, i) => {gb.pulse.setNote(0, notes[i]); gb.pulse.keyOn(0);});
      await wait(650, {signal});
      synths.forEach(gb => gb.pulse.keyOff(0));
      await wait(100, {signal});
    }
    await Promise.all(transports.map(transport => transport.flush()));
    status.textContent = 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    resetButton.disabled = true;
    resetButton.onclick = null;
    for (const input of strips.querySelectorAll('input')) input.disabled = true;
    await Promise.allSettled(transports.map(transport => transport.close()));
    await Promise.allSettled(chips.map(chip => chip.dispose()));
    await context?.close();
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }

  function refresh() {
    for (const row of strips.children) {
      const mix = mixer.get(row.dataset.id);
      row.querySelector('[name=volume]').value = mix.volume;
      row.querySelector('[name=pan]').value = mix.pan;
      row.querySelector('[name=muted]').checked = mix.muted;
    }
    detail.textContent = JSON.stringify(mixer.list(), null, 2);
  }
  function addStrip(chip, mixer) {
    const row = document.createElement('fieldset');
    row.dataset.id = chip.id;
    const legend = document.createElement('legend');
    legend.textContent = chip.id;
    row.append(legend);
    for (const [name, title, min, max] of [['volume', 'Volume', 0, 2], ['pan', 'Pan', -1, 1]]) {
      const label = document.createElement('label');
      label.append(`${title} `);
      const input = document.createElement('input');
      Object.assign(input, {type: 'range', name, min, max, step: 0.01});
      input.addEventListener('input', () => {
        mixer.set(chip.id, {[name]: Number(input.value)});
        refresh();
      });
      label.append(input);
      row.append(label);
    }
    const label = document.createElement('label');
    const mute = document.createElement('input');
    Object.assign(mute, {type: 'checkbox', name: 'muted'});
    mute.addEventListener('change', () => {mixer.set(chip.id, {muted: mute.checked}); refresh();});
    label.append(mute, ' Mute');
    row.append(label);
    strips.append(row);
    refresh();
  }
});
stopButton.addEventListener('click', () => controller?.abort());
window.addEventListener('pagehide', () => controller?.abort());

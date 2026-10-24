import {createSoundChip, SoundChipMixer, SOUNDCHIP_MIXER_PRESETS} from 'tetorica-fm2612';
import {YM2612Synth, YM2612WorkletTransport} from 'tetorica-fm2612/ym2612synth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {SegaPSGSynth} from 'tetorica-fm2612/segapsgsynth.js';
import {AY8910Synth} from 'tetorica-fm2612/ay8910synth.js';
import {SegaPSGWorkletTransport, AY8910WorkletTransport} from 'tetorica-fm2612/chip_worklet_transport.js';
import {NesApuSynth, NesApuWorkletTransport} from 'tetorica-fm2612/nesapusynth.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const balance = document.getElementById('balance');
const status = document.getElementById('status');
const rows = [...document.querySelectorAll('#strips tbody tr')];
let currentRun = null;

// Each voice uses one physical channel; no music or sample ROM is needed.
const references = [
  {kind: 'ym2612', label: 'YM2612 FM', Transport: YM2612WorkletTransport, createVoice(transport) {
    const fm = new YM2612Synth({transport});
    fm.setPreset(0, FM_PRESETS['one-op-basic']);
    // Keep the preset's sole carrier at a constant level for this comparison.
    fm.setOperator(0, 3, {tl: 0, ar: 31, d1r: 0, d2r: 0, sl: 0, rr: 15});
    fm.setPan(0, true, true);
    return {on: () => fm.noteOn(0, 'A4'), off: () => fm.noteOff(0)};
  }},
  {kind: 'segapsg', label: 'Sega PSG', Transport: SegaPSGWorkletTransport, createVoice(transport) {
    const psg = new SegaPSGSynth({transport});
    psg.allNotesOff();
    return {on: () => psg.tone(0, {frequency: 440, attenuation: 0}), off: () => psg.off(0)};
  }},
  {kind: 'ay8910', label: 'AY-3-8910', Transport: AY8910WorkletTransport, createVoice(transport) {
    const ay = new AY8910Synth({transport});
    ay.initialize();
    return {on: () => ay.tone(0, {frequency: 440, volume: 15, envelope: false}), off: () => ay.keyOff(0)};
  }},
  {kind: 'nes', label: 'NES pulse', Transport: NesApuWorkletTransport, createVoice(transport) {
    const nes = new NesApuSynth({transport});
    nes.pulse.setVoice(0, {duty: 0.5, volume: 15, sweep: {enabled: false, period: 0, shift: 0}});
    nes.pulse.setFrequency(0, 440);
    return {on: () => nes.pulse.keyOn(0), off: () => nes.pulse.keyOff(0)};
  }},
];

function createMixer() {
  return balance.value === 'calibrated'
    ? new SoundChipMixer(SOUNDCHIP_MIXER_PRESETS.calibrated)
    : new SoundChipMixer();
}

function refreshGains(mixer, chips = []) {
  for (const row of rows) {
    const chip = chips.find(chip => chip.name === row.dataset.chip);
    const settings = chip ? mixer.get(chip.id) : mixer.getKindDefault(row.dataset.chip);
    const cell = row.querySelector('[data-volume]');
    cell.dataset.gain = String(settings.volume);
    cell.textContent = String(settings.volume);
    cell.title = `${Number((settings.volume * 100).toFixed(4))}%`;
    if (chip) row.dataset.id = chip.id;
    else delete row.dataset.id;
  }
}

function showActive(kind) {
  for (const row of rows) {
    const active = row.dataset.chip === kind;
    row.dataset.state = active ? 'playing' : 'idle';
    row.dataset.active = String(active);
    row.querySelector('[data-status]').textContent = active ? '440 Hz 再生中' : '待機';
  }
}

function wait(milliseconds, signal) {
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
  if (currentRun) return;
  const run = {controller: new AbortController(), mixer: createMixer(), chips: [], transports: [], voices: [], activeChip: null};
  currentRun = run;
  const {signal} = run.controller;
  playButton.disabled = true;
  stopButton.disabled = false;
  balance.disabled = true;
  status.textContent = 'Loading…';
  refreshGains(run.mixer);
  const unsubscribe = run.mixer.subscribe(() => refreshGains(run.mixer, run.chips));
  let result = 'Finished.';
  try {
    run.context = new AudioContext();
    run.master = run.context.createGain();
    run.master.gain.value = 0.3;
    run.master.connect(run.context.destination);
    // Abort silences the shared output immediately, including during loading.
    signal.addEventListener('abort', () => {run.master.gain.value = 0;}, {once: true});
    await run.context.resume();
    for (const reference of references) {
      signal.throwIfAborted();
      const chip = await createSoundChip(reference.kind, {
        execution: 'worklet', mixer: run.mixer, audioContext: run.context,
        outputNode: run.master, gain: 1, signal,
      });
      run.chips.push(chip);
      signal.throwIfAborted();
      const transport = new reference.Transport(chip);
      run.transports.push(transport);
      await transport.start();
      signal.throwIfAborted();
      run.voices.push(reference.createVoice(transport));
      await transport.flush();
      refreshGains(run.mixer, run.chips);
    }
    for (let i = 0; i < references.length; i++) {
      signal.throwIfAborted();
      const {kind, label} = references[i];
      run.voices[i].on();
      await run.transports[i].flush();
      signal.throwIfAborted();
      run.activeChip = kind;
      showActive(kind);
      status.textContent = `${label} · 440 Hz`;
      await wait(1200, signal);
      run.voices[i].off();
      await run.transports[i].flush();
      run.activeChip = null;
      showActive(null);
      await wait(250, signal);
    }
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (run.master) run.master.gain.value = 0;
    for (const voice of run.voices) {try {voice.off();} catch { /* Continue releasing all endpoints. */ }}
    await Promise.allSettled(run.transports.map(transport => transport.close()));
    await Promise.allSettled(run.chips.map(chip => chip.dispose()));
    if (run.context && run.context.state !== 'closed') await run.context.close().catch(() => {});
    unsubscribe();
    run.activeChip = null;
    showActive(null);
    currentRun = null;
    playButton.disabled = false;
    stopButton.disabled = true;
    balance.disabled = false;
    status.textContent = result;
  }
});

stopButton.addEventListener('click', () => currentRun?.controller.abort());
balance.addEventListener('change', () => refreshGains(createMixer()));
window.addEventListener('pagehide', () => {
  currentRun?.controller.abort();
  void currentRun?.context?.close().catch(() => {});
});
refreshGains(createMixer());

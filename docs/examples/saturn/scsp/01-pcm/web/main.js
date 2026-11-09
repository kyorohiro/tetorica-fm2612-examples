import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const executionSelect = document.getElementById('execution');
const editor = document.getElementById('code');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const stateView = document.getElementById('state');
let activeRun = null;
const SLOTS = [0, 1, 31];
// Globals below belong to the Playground script, not this page.
editor.value = `// Software selection/conversion; this helper is not SCSP hardware.
const {prepareScspPCM} = await import(${JSON.stringify(runtimeAssetUrl('scsp_sample.js').href)});
const sourceRate = 28160, length = 128; // One period = 220 Hz, not guessed from PCM.
const audio = {sampleRate:sourceRate, channels:[Float32Array.from({length}, (_, i) =>
  0.32 * Math.sin(2 * Math.PI * i / length) + 0.06 * Math.sin(6 * Math.PI * i / length))]};
const saturn = await useSoundChip('scsp');
const samples = [];
for (const bits of [8, 16]) {
  const draft = prepareScspPCM(audio, {startSeconds:0, endSeconds:length/sourceRate,
    sourceSampleRate:sourceRate, rootNote:'A3', bits});
  samples.push(await saturn.loadPCM(draft.pcm, {
    baseFrequencyHz:draft.sample.rootFrequencyHz,
    sourceSampleRate:draft.sample.sourceSampleRate, loopStartSamples:0,
  }));
}
const envelope = {attackRate:31, decay1Rate:8, decay2Rate:0,
  decayLevel:8, releaseRate:24, keyRateScaling:15};
// 32 physical slots, no automatic allocator. Slot 31 is the last valid slot.
for (const slot of [0, 1, 31]) saturn.setPreset(slot, {
  sample:samples[slot === 0 ? 0 : 1], envelope, totalLevel:24, directLevel:0,
});
saturn.setMix(1, {directLevel:7});
saturn.noteOn(1, 'A3');
console.log('SCSP_READY');
await sleep(20); // Finite audition; use the live controls or Stop.
saturn.allNotesOff();
await sleep(0.8); // Allow Worker lookahead / release before closing audio.`;

const errorText = error => error?.message ?? String(error);
function report(run, message) {
  if (activeRun !== run) return;
  run.messages.push(String(message).slice(0, 600));
  if (run.messages.length > 16) run.messages.shift();
  detail.textContent = run.messages.join('\n');
}
function enableControls(enabled) {
  for (const control of document.querySelectorAll('[data-live]')) control.disabled = !enabled;
}
// Coalesce state reads: dragging a control never accumulates Worklet RPCs.
async function readState(run) {
  if (run.reading) { run.readAgain = true; return; }
  run.reading = true;
  try {
    do {
      run.readAgain = false;
      const state = await run.scsp.getState();
      if (activeRun !== run || run.controller.signal.aborted) return;
      stateView.textContent = JSON.stringify({sampleRate:state.sampleRate,
        ramUsedBytes:state.ramUsedBytes, samples:state.samples,
        slots:SLOTS.map(slot => ({slot, ...state.slots[slot],
          playingLfo:state.playingLfos[slot], playingModulation:state.playingModulations[slot]}))}, null, 2);
    } while (run.readAgain);
  } catch (error) {
    if (!run.controller.signal.aborted) { report(run, errorText(error)); stop(); }
  } finally { run.reading = false; }
}
function live(update) {
  const run = activeRun;
  if (!run?.ready || run.controller.signal.aborted) return;
  // Admin edits validate against applied Worklet settings, including guarded
  // samples authored by Worker. Serialize edits; do not borrow its private port.
  run.changes = run.changes.then(async () => {
    if (activeRun !== run || !run.ready || run.controller.signal.aborted) return;
    await update(run.controls);
    if (!run.controller.signal.aborted) void readState(run);
  }).catch(error => { if (!run.controller.signal.aborted) report(run, errorText(error)); });
}
let selectedSlot = 1;
document.getElementById('slot').addEventListener('change', event => live(async scsp => {
  for (const slot of SLOTS) { await scsp.keyOff(slot); await scsp.setMix(slot, {directLevel:0}); }
  selectedSlot = Number(event.target.value);
  await scsp.setMix(selectedSlot, {directLevel:7});
  await scsp.noteOn(selectedSlot, document.getElementById('note').value);
}));
document.getElementById('note').addEventListener('change', event => live(async scsp => await scsp.setNote(selectedSlot, event.target.value)));
document.getElementById('retrigger').addEventListener('click', () => live(async scsp => await scsp.noteOn(selectedSlot, document.getElementById('note').value)));
document.getElementById('release').addEventListener('click', () => live(async scsp => await scsp.keyOff(selectedSlot)));
document.getElementById('release-rate').addEventListener('input', event => live(async scsp => {
  // Envelope edits configure the NEXT keyOn; they do not rewrite a running EG.
  for (const slot of SLOTS) await scsp.setEnvelope(slot, {releaseRate:Number(event.target.value)});
}));
playButton.addEventListener('click', async () => {
  if (activeRun) return;
  const run = {controller:new AbortController(), runtime:null, scsp:null,
    ready:false, reading:false, readAgain:false, changes:Promise.resolve(), messages:[]};
  activeRun = run;
  const {signal} = run.controller;
  let result = 'Finished.';
  playButton.disabled = true; stopButton.disabled = false; executionSelect.disabled = true;
  enableControls(false); status.textContent = 'Loading…'; detail.textContent = ''; stateView.textContent = '';
  for (const control of document.querySelectorAll('[data-live]')) {
    if (control.tagName === 'SELECT') control.value = [...control.options].find(option => option.defaultSelected)?.value ?? control.options[0].value;
    else if (control.type === 'checkbox') control.checked = control.defaultChecked;
    else if (control.tagName === 'INPUT') control.value = control.defaultValue;
  }
  selectedSlot = 1;
  try {
    const pg = Playground({chip:'scsp',
      logicWorkerUrl:runtimeAssetUrl('playground_logic_worker.js').href,
      onStatus:message => report(run, message),
      onLog(line) {
        report(run, line);
        if (String(line).includes('SCSP_READY') && activeRun === run && !signal.aborted) {
          run.ready = true; enableControls(true); status.textContent = 'Playing…';
          void readState(run);
        }
      },
    });
    run.runtime = pg;
    await pg.initialize(); signal.throwIfAborted();
    run.scsp = pg.megaDrive.primaryApis.scsp;
    run.controls = Object.fromEntries(['setLfo','setModulation','setMix','setEnvelope'].map(method =>
      [method, (...args) => pg.chipInspector.invoke('scsp', method, args)]));
    for (const method of ['keyOff','noteOn','setNote'])
      run.controls[method] = (...args) => run.scsp[method](...args);
    pg.setMasterVolume(0.35); // Explicit host gain, not sample normalization.
    pg.load('saturn-scsp-01-pcm', editor.value);
    await pg.play('saturn-scsp-01-pcm', {execution:executionSelect.value});
    signal.throwIfAborted();
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : `Error: ${errorText(error)}`;
    if (!signal.aborted) report(run, result);
  } finally {
    run.ready = false; enableControls(false);
    try { await run.runtime?.finalize(); }
    catch (error) { result = `Cleanup error: ${errorText(error)}`; report(run, result); }
    if (activeRun === run) {
      activeRun = null; playButton.disabled = false; stopButton.disabled = true;
      executionSelect.disabled = false; status.textContent = result;
    }
  }
});
function stop() {
  const run = activeRun;
  if (!run || run.controller.signal.aborted) return;
  run.controller.abort(); run.ready = false; enableControls(false);
  stopButton.disabled = true; status.textContent = 'Stopping…';
  try { run.runtime?.stop(); } catch (error) { report(run, errorText(error)); }
}
stopButton.addEventListener('click', stop);
window.addEventListener('pagehide', stop);

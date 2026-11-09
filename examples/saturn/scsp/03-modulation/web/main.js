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
const SLOTS = [0, 1];
// Globals below belong to the Playground script, not this page.
editor.value = `const saturn = await useSoundChip('scsp');
const pcm = Int16Array.from({length:64}, (_, i) => Math.round(8192 * Math.sin(2 * Math.PI * i / 64)));
// Full loop + periodic guard copies protect reads even at maximum allowed depth.
const sample = await saturn.loadPCM(pcm, {
  baseFrequencyHz:44100/64, loopStartSamples:0, modulationDepth:12,
});
// Append-only allocation: this unrelated sample does not replace the first.
const neighbor = await saturn.loadPCM(new Int16Array(257).fill(24000), {rootNote:'A4'});
if (sample.id === neighbor.id) throw new Error('Samples must remain independent');
saturn.setPreset(0, {sample, directLevel:0, totalLevel:0}); // Silent helper.
saturn.setPreset(1, {sample, totalLevel:24,
  modulation:{depth:9, xOffset:63, yOffset:63, writeInhibit:false}});
// Offsets are relative 64-word sound-stack addresses, NOT slot IDs.
// In this pinned zero-slot-write-delay core, 63 reads the preceding slot now;
// 31 reads that slot's previous frame. Exact physical timing is not claimed.
saturn.noteOn(0, 'A4');
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
function setDepth(value) {
  document.getElementById('depth').value = String(value);
  live(async scsp => await scsp.setModulation(1, {depth:value}));
}
document.getElementById('depth').addEventListener('input', event => setDepth(Number(event.target.value)));
document.getElementById('dry').addEventListener('click', () => setDepth(0));
document.getElementById('fm').addEventListener('click', () => setDepth(9));
document.getElementById('offset').addEventListener('change', event => live(async scsp => await scsp.setModulation(1,
  {xOffset:Number(event.target.value), yOffset:Number(event.target.value)})));
document.getElementById('audible-helper').addEventListener('change', event => live(async scsp => await scsp.setMix(0, {directLevel:event.target.checked ? 7 : 0})));
document.getElementById('helper-tl').addEventListener('input', event => live(async scsp => await scsp.setMix(0, {totalLevel:Number(event.target.value)})));
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
    pg.load('saturn-scsp-03-modulation', editor.value);
    await pg.play('saturn-scsp-03-modulation', {execution:executionSelect.value});
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

import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const loadButton = document.getElementById('load');
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const fileInput = document.getElementById('file');
const voiceSelect = document.getElementById('voice');
const execution = document.getElementById('execution');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
let bankBytes = null;
let bankName = '';
let voices = [];
let running = null;

// File I/O belongs to the host. Playground's guarded script does not fetch.
// Keep the last successfully loaded bank if a later upload is invalid.
async function readBank(signal) {
  const file = fileInput.files[0];
  let bytes;
  if (file) {
    if (file.size !== 163 && file.size !== 4104) {
      throw new Error('DX7 SysEx must be 163 bytes (1 voice) or 4104 bytes (32 voices).');
    }
    bytes = new Uint8Array(await file.arrayBuffer());
  } else {
    const response = await fetch('../assets/original-bank.syx', {signal});
    if (!response.ok) throw new Error('Could not load example bank: HTTP ' + response.status);
    bytes = new Uint8Array(await response.arrayBuffer());
  }
  signal.throwIfAborted();
  return {bytes, name:file?.name || 'original-bank.syx'};
}

async function run(audition) {
  if (running || (audition && !bankBytes)) return;
  const current = {controller:new AbortController(), runtime:null, stopping:null};
  running = current;
  const signal = current.controller.signal;
  loadButton.disabled = playButton.disabled = fileInput.disabled = voiceSelect.disabled = execution.disabled = true;
  stopButton.disabled = false;
  status.textContent = audition ? 'Preparing audition…' : 'Loading bank…';
  let result = 'Stopped.';
  try {
    // Create/resume audio from a user gesture, before asynchronous file reads.
    const pg = current.runtime = Playground({
      audioWorkletUrl:runtimeAssetUrl('ym2612-worklet.js').href,
      ym2612WasmUrl:runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
      segaPsgWasmUrl:runtimeAssetUrl('generated/segapsg_wasm.wasm').href,
      logicWorkerUrl:runtimeAssetUrl('playground_logic_worker.js').href,
      onLog(line) {
        if (line.startsWith('DX7_VOICES:')) current.voices = JSON.parse(line.slice('DX7_VOICES:'.length));
      },
    });
    await pg.initialize();
    signal.throwIfAborted();
    pg.setMasterVolume(0.5);
    const bank = audition ? {bytes:bankBytes, name:bankName} : await readBank(signal);
    signal.throwIfAborted();
    const selected = audition ? Number(voiceSelect.value) : 0;
    if (!Number.isInteger(selected) || selected < 0 || selected >= (audition ? voices.length : 1)) {
      throw new Error('Choose a voice from the loaded bank.');
    }

    // Numeric literals also reach Worker execution. pg.context is not shared
    // between Main and Worker. DX7 bulk dumps are bounded at 4104 bytes.
    const source = [
      'const bankBytes = new Uint8Array(' + JSON.stringify(Array.from(bank.bytes)) + ');',
      "const dx7 = await useSoundChip('dx7');",
      'await dx7.loadSysex(bankBytes); // Wait before selecting or playing.',
      "console.log('DX7_VOICES:' + JSON.stringify(dx7.voices));",
      'dx7.selectVoice(' + selected + ');',
      'await mixer.set(dx7.id, {volume:0.5});',
      ...(audition ? [
        'setBpm(120);',
        'for (const note of [60, 64, 67]) { // MIDI C4, E4, G4.',
        '  dx7.noteOn(note, 100);',
        '  await beat(0.5);',
        '  dx7.noteOff(note);',
        '  await beat(0.125);',
        '}',
        'for (const note of [60, 64, 67]) dx7.noteOn(note, 90);',
        'await beat(1);',
        'dx7.allNotesOff();',
        'await sleep(0.5); // Let the release tail sound before disposal.',
      ] : []),
    ].join('\n');
    pg.load('dx7-sysex', source);
    if (audition) status.textContent = 'Playing…';
    await pg.play('dx7-sysex', {execution:execution.value});
    signal.throwIfAborted();
    if (!current.voices?.length) throw new Error('No voices were returned by the DX7.');
    if (!audition) {
      bankBytes = bank.bytes;
      bankName = bank.name;
      voices = current.voices;
      voiceSelect.replaceChildren(...voices.map(voice => {
        const option = document.createElement('option');
        option.value = String(voice.index);
        option.textContent = voice.index + ' — ' + voice.name;
        return option;
      }));
    }
    detail.textContent = bankName + '\n' + voices.length + ' voice(s) · ' + execution.value +
      '\nSelected: ' + selected + ' — ' + voices[selected].name;
    result = audition ? 'Finished.' : 'Loaded ' + voices.length + ' voice(s). Choose a voice and press Play.';
  } catch (error) {
    result = signal.aborted ? 'Stopped.' : 'Error: ' + error.message +
      (bankBytes ? ' The previous bank is still available for Play.' : '');
  } finally {
    try {
      try { await current.stopping; }
      finally { await current.runtime?.finalize(); }
    } catch (error) {
      result = 'Error closing audio: ' + error.message;
    } finally {
      running = null;
      loadButton.disabled = fileInput.disabled = execution.disabled = false;
      playButton.disabled = voiceSelect.disabled = !bankBytes;
      stopButton.disabled = true;
      status.textContent = result;
    }
  }
}

loadButton.addEventListener('click', () => void run(false));
playButton.addEventListener('click', () => void run(true));
stopButton.addEventListener('click', () => {
  const current = running;
  if (!current) return;
  current.controller.abort();
  stopButton.disabled = true;
  status.textContent = 'Stopping…';
  // Cancel runtime beat/sleep as well as host I/O; fade before final disposal.
  current.stopping ??= (async () => {
    try { await current.runtime?.stopWithFade(); }
    catch (error) {
      detail.textContent = 'Fade stop failed: ' + error.message;
      try { current.runtime?.stop(); } catch {}
    }
  })();
});
window.addEventListener('pagehide', () => {
  running?.controller.abort();
  running?.runtime?.stop();
});

import {Playground} from 'tetorica-fm2612/playground_runtime.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

export function setupPlayer(title, sourceText) {
  const playButton = document.getElementById('play');
  const stopButton = document.getElementById('stop');
  const executionSelect = document.getElementById('execution');
  const editor = document.getElementById('code');
  const status = document.getElementById('status');
  const detail = document.getElementById('detail');
  let activeRun = null;

  editor.value = sourceText;

  const errorMessage = error => error?.message ?? String(error);

  function report(run, message) {
    if (activeRun !== run) return;
    run.messages.push(String(message).slice(0, 500));
    if (run.messages.length > 16) run.messages.shift();
    detail.textContent = run.messages.join('\n');
  }

  playButton.addEventListener('click', async () => {
    if (activeRun) return;
    const run = {controller: new AbortController(), runtime: null, messages: []};
    activeRun = run;
    const {signal} = run.controller;
    const execution = executionSelect.value;
    const source = editor.value; // Edits made during playback apply to the next Play.
    let result = 'Finished.';
    playButton.disabled = true;
    stopButton.disabled = false;
    executionSelect.disabled = true;
    status.textContent = 'Loading…';
    report(run, `${title} · ${execution === 'worker' ? 'Worker' : 'Main'} execution`);

    try {
      const pg = Playground({
        audioWorkletUrl: runtimeAssetUrl('ym2612-worklet.js').href,
        ym2612WasmUrl: runtimeAssetUrl('generated/ym2612_wasm.wasm').href,
        segaPsgWasmUrl: runtimeAssetUrl('generated/segapsg_wasm.wasm').href,
        logicWorkerUrl: runtimeAssetUrl('playground_logic_worker.js').href,
        onStatus(message) { report(run, message); },
        onLog(line) { report(run, line); },
      });
      run.runtime = pg;
      // Start/resume audio from the Play click. Initialization has no AbortSignal
      // parameter, so a Stop during loading is checked before any script starts.
      await pg.initialize();
      signal.throwIfAborted();
      pg.setMasterVolume(0.5);
      pg.load(title, source);
      status.textContent = 'Playing…';
      // This finite script owns its note lengths and release window. Its Promise
      // completes after the final beat, without a separate host playback timer.
      await pg.play(title, {execution});
      signal.throwIfAborted();
    } catch (error) {
      result = signal.aborted ? 'Stopped.' : `Error: ${errorMessage(error)}`;
      if (!signal.aborted) report(run, result);
    } finally {
      try {
        // Cleanup also runs after loading errors or a Stop during initialization.
        await run.runtime?.finalize();
      } catch (error) {
        result = `Cleanup error: ${errorMessage(error)}`;
        report(run, result);
      } finally {
        run.runtime = null;
        if (activeRun === run) {
          activeRun = null;
          playButton.disabled = false;
          stopButton.disabled = true;
          executionSelect.disabled = false;
          status.textContent = result;
        }
      }
    }
  });

  function stop() {
    const run = activeRun;
    if (!run || run.controller.signal.aborted) return;
    run.controller.abort();
    stopButton.disabled = true;
    status.textContent = 'Stopping…';
    try { run.runtime?.stop(); }
    catch (error) { report(run, `Stop error: ${errorMessage(error)}`); }
    // The Play handler finalizes after any in-flight initialization settles.
    // Finalizing before initialization finishes could leave late-created audio.
  }

  stopButton.addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
}

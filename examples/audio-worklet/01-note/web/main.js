import {YM2612Synth, YM2612WorkletTransport} from 'tetorica-fm2612/ym2612synth.js';
import {FM_PRESETS} from 'tetorica-fm2612/megasynth-fm-presets.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
let controller;

playButton.addEventListener('click', async () => {
  if (controller) return;
  controller = new AbortController();
  const signal = controller.signal;
  playButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = 'Initializing AudioWorklet…';
  let context;
  let node;
  let gain;
  let transport;
  try {
    // Create and resume audio from the click, before asynchronous loading.
    context = new AudioContext();
    await context.resume();
    if (!context.audioWorklet) throw new Error('AudioWorklet requires HTTPS or localhost.');

    // Load the package's processor. Its relative JS imports remain beside it.
    await context.audioWorklet.addModule(runtimeAssetUrl('ym2612-worklet.js').href);
    signal.throwIfAborted();

    // Fetch WASM on the main thread, then transfer its bytes to the processor.
    const response = await fetch(runtimeAssetUrl('generated/ym2612_wasm.wasm'), {signal});
    if (!response.ok) throw new Error(`WASM: HTTP ${response.status}`);
    const wasmBinary = await response.arrayBuffer();
    signal.throwIfAborted();

    node = new AudioWorkletNode(context, 'ym2612-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    gain = context.createGain();
    gain.gain.value = 0.25;
    node.connect(gain);
    gain.connect(context.destination);

    // Wait for ready before sending any Synth commands. Handle initialization
    // errors, Stop during loading, and a processor that never responds.
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
        node.port.onmessage = null;
        node.onprocessorerror = null;
      };
      const abort = () => { cleanup(); reject(signal.reason); };
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('AudioWorklet initialization timed out.'));
      }, 10000);
      signal.addEventListener('abort', abort, {once: true});
      node.onprocessorerror = () => {
        cleanup();
        reject(new Error('AudioWorklet processor failed.'));
      };
      node.port.onmessage = event => {
        if (event.data.type === 'ready') {
          cleanup();
          resolve();
        } else if (event.data.type === 'error') {
          cleanup();
          reject(new Error(event.data.message));
        }
      };
      node.port.postMessage({type: 'initialize', wasmBinary}, [wasmBinary]);
    });
    signal.throwIfAborted();

    // Synth writes are sent through the MessagePort. The processor generates
    // and resamples PCM on the audio thread; no generateStereo() runs here.
    transport = new YM2612WorkletTransport(node);
    const fm = new YM2612Synth({transport});
    fm.setPreset(0, FM_PRESETS.sine);
    fm.noteOn(0, 4, 553);
    status.textContent = 'Playing…';

    await new Promise(resolve => {
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', finish);
        resolve();
      };
      const timer = setTimeout(finish, 600);
      signal.addEventListener('abort', finish, {once: true});
    });
    signal.throwIfAborted();
    fm.noteOff(0);

    // Allow the release envelope to finish before closing the audio device.
    await new Promise(resolve => {
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', finish);
        resolve();
      };
      const timer = setTimeout(finish, 200);
      signal.addEventListener('abort', finish, {once: true});
    });
    status.textContent = signal.aborted ? 'Stopped.' : 'Finished.';
  } catch (error) {
    status.textContent = signal.aborted ? 'Stopped.' : `Error: ${error.message}`;
  } finally {
    if (transport) {
      transport.reset();
      transport.dispose();
    }
    if (node) {
      node.disconnect();
      node.port.close();
    }
    if (gain) gain.disconnect();
    if (context && context.state !== 'closed') await context.close();
    controller = null;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});

stopButton.addEventListener('click', () => { controller?.abort(); });
window.addEventListener('pagehide', () => { controller?.abort(); });

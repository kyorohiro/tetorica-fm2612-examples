import {SpcRuntimeSynth} from 'tetorica-fm2612/spc_audio.js';

const file = document.querySelector('#file');
const playButton = document.querySelector('#play');
const pauseButton = document.querySelector('#pause');
const stopButton = document.querySelector('#stop');
const volume = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const seconds = document.querySelector('#seconds');
const position = document.querySelector('#position');
const status = document.querySelector('#status');
const detail = document.querySelector('#detail');
let player = null, generation = 0, fetchController = null, pollTimer = null;
let busy = false, playing = false, paused = false, disposed = false, duration = 10;

function renderControls() {
  playButton.disabled = busy || playing || paused;
  pauseButton.disabled = busy || (!playing && !paused);
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
  stopButton.disabled = !busy && !player;
  seconds.disabled = busy || Boolean(player);
}
function describeError(error) { return error instanceof Error ? `${error.name}: ${error.message}` : String(error); }
function isCurrent(token, synth) { return !disposed && token === generation && player === synth; }

// Detach immediately: pending fetch/load/play results can never revive this run.
async function stop(message = 'Stopped. 次の Play は元の SPC から再生します。') {
  ++generation;
  fetchController?.abort(); fetchController = null;
  clearTimeout(pollTimer); pollTimer = null;
  const previous = player;
  player = null; busy = playing = paused = false;
  position.textContent = '0.00 s';
  status.textContent = message;
  renderControls();
  try { await previous?.close(); }
  catch (error) { console.error('SPC close:', error); }
}

function poll(token, synth) {
  clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    try {
      const state = await synth.getState();
      if (!isCurrent(token, synth)) return;
      position.textContent = `${state.positionSeconds.toFixed(2)} / ${duration.toFixed(1)} s`;
      if (state.playing && state.positionSeconds >= duration) {
        await stop(`Finished. 再生上限 ${duration} 秒に達しました。`);
      } else if (state.playing) poll(token, synth);
    } catch (error) {
      if (isCurrent(token, synth)) await stop(describeError(error));
    }
  }, 100);
}

playButton.addEventListener('click', async () => {
  if (busy || player || disposed) return;
  const requestedSeconds = Number(seconds.value);
  if (!Number.isFinite(requestedSeconds) || requestedSeconds < 0.1 || requestedSeconds > 600) {
    status.textContent = '再生上限を 0.1〜600 秒で指定してください。'; return;
  }
  duration = requestedSeconds;
  const token = ++generation;
  const selectedFile = file.files[0];
  const synth = new SpcRuntimeSynth({
    masterVolume: Number(volume.value) / 100,
    onError(error) { if (isCurrent(token, synth)) void stop(describeError(error)); },
  });
  player = synth; busy = true;
  fetchController = new AbortController();
  const signal = fetchController.signal;
  status.textContent = `Loading ${selectedFile?.name ?? 'original.spc'}…`;
  renderControls();
  try {
    // Start/resume the context inside the user gesture, while reading file bytes.
    const ready = synth.start();
    // Attach a handler immediately if the file request fails before initialization.
    ready.catch(() => {});
    let bytes;
    if (selectedFile) {
      if (selectedFile.size > 16 * 1024 * 1024) throw new RangeError('SPC file must be no larger than 16 MiB');
      bytes = await selectedFile.arrayBuffer();
    } else {
      const response = await fetch(new URL('../assets/original.spc', import.meta.url), {signal});
      if (!response.ok) throw new Error(`SPC: HTTP ${response.status}`);
      bytes = await response.arrayBuffer();
    }
    if (!isCurrent(token, synth)) return;
    await ready;
    if (!isCurrent(token, synth)) return;
    await synth.loadSPC(bytes);
    if (!isCurrent(token, synth)) return;
    await synth.play();
    if (!isCurrent(token, synth)) return;
    busy = false; playing = true; paused = false;
    detail.textContent = `Native SPC: 32,000 Hz · stereo\nAudioContext output: ${synth.audioContext.sampleRate.toLocaleString()} Hz · output-side resampling\n${selectedFile?.name ?? 'original.spc (original authored data)'}`;
    status.textContent = 'Playing.';
    renderControls(); poll(token, synth);
  } catch (error) {
    if (isCurrent(token, synth)) await stop(describeError(error));
  }
});

pauseButton.addEventListener('click', async () => {
  if (busy || !player || disposed) return;
  const synth = player, token = generation, resume = paused;
  busy = true; clearTimeout(pollTimer); renderControls();
  try {
    const state = await (resume ? synth.play() : synth.pause());
    if (!isCurrent(token, synth)) return;
    busy = false; playing = state.playing; paused = !state.playing;
    position.textContent = `${state.positionSeconds.toFixed(2)} / ${duration.toFixed(1)} s`;
    status.textContent = paused ? 'Paused. Resume で同じ位置から再生します。' : 'Playing.';
    renderControls();
    if (playing) poll(token, synth);
  } catch (error) {
    if (isCurrent(token, synth)) await stop(describeError(error));
  }
});
stopButton.addEventListener('click', () => void stop());
file.addEventListener('change', () => void stop(`Ready. ${file.files[0]?.name ?? '同梱 original.spc'} を次の Play で読み込みます。`));
volume.addEventListener('input', () => {
  volumeValue.value = `${volume.value}%`;
  try { player?.setMasterVolume(Number(volume.value) / 100); }
  catch (error) { if (player) void stop(describeError(error)); }
});
window.addEventListener('pagehide', () => { disposed = true; void stop('Closed.'); }, {once: true});

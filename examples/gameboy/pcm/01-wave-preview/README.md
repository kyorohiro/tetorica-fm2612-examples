# PCM cycle → Game Boy Wave RAM preview

These are **software preparation and audition helpers**:

- `renderGameboySampleComparison()` returns the selected original cycle and the converted **32 × 4-bit Wave RAM** values.
- `renderGameboySamplePreview()` receives the actual published Game Boy WASM factory and renders through a private real APU. It creates no live chip, AudioContext or output device, and disposes the core before returning PCM.

This example generates one original 96-frame cycle with a sine plus a third harmonic. The selection is deliberately one full cycle; this is not automatic pitch detection or whole-recording playback. The helper resamples that cycle into 32 Wave RAM values from 0 to 15. `rootMidi: 69` explicitly requests A4; the hardware divider determines the nearby actual frequency. Cents metadata does not add a second hidden pitch shift to the independently pitched wave channel.

The returned chip preview **already includes the Game Boy listening gain and 5 ms endpoint fades**. Web playback and WAV export use those channels unchanged at gain 1. The same reported listening gain is applied only to the original comparison signal, which has not been processed by the preview helper. Neither signal is normalized.

Web offers source/chip comparison, the original cycle and Wave RAM plot, Stop during preparation, and WAV export. It plays the already rendered PCM through an `AudioBuffer`; it is not a live APU worklet. Each Play creates and closes its own Web Audio player, and late cancelled results cannot restart it.

```sh
node examples/gameboy/pcm/01-wave-preview/node/main.mjs ./gameboy-wave-preview.wav
```

Node writes the helper's 0.85-second, 44.1 kHz PCM16 stereo preview and verifies finite sustained AC output near A4. It needs no audio device. Web and Node are intentionally independent complete files, each importing only the published npm APIs and actual generated WASM factory.

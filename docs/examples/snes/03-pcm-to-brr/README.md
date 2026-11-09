# PCM → BRR → S-DSP

`encodeBrr()` is a **software preparation helper**, not a chip register. This example generates its own 64-sample PCM cycle, encodes it as four complete BRR blocks, then uploads those bytes to a real `SnesDspCore` / `SnesSynth` from the installed npm package.

- Source and `loopStartSamples: 0` are aligned to the BRR block's 16 samples. No input is silently shortened or resampled.
- The chip renders at its native **32,000 Hz**. At hardware PITCH 4096, this 64-sample loop repeats at **500 Hz**. BRR does not store a root note; `baseFrequencyHz: 500` declares the musical tuning separately.
- The source plays for one second, then the chip's Gate releases for 0.2 seconds. Output gain 0.4 is applied once; no normalization or external sample is used.
- Encoder metrics describe reconstructed BRR before S-DSP interpolation, envelope and channel volumes. The displayed chip excerpt includes those hardware operations and need not line up with the source.

The Web page offers **Play chip**, **Play source**, **Stop** and **Save chip WAV**. It computes disposable chip PCM offline, releases the core, then plays that result through an `AudioBuffer`. This is not a live S-DSP AudioWorklet. Preparing data does not itself create a sound chip device output; each Play owns and closes its own Web Audio player.

```sh
node examples/snes/03-pcm-to-brr/node/main.mjs ./pcm-to-brr.wav
```

Node writes a 1.2-second, 32 kHz PCM16 stereo WAV with duplicated mono output. It checks finite sustained AC output and the expected 500 Hz pitch without requiring an audio device. Web and Node each contain the full conversion and rendering code; neither imports a custom shared audio helper.

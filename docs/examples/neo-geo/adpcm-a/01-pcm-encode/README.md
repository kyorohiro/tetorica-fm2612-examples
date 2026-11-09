# PCM → ADPCM-A → YM2610B

`encodeAdpcmA()` is **software sample preparation**. The resulting bytes are then decoded by the actual YM2610B `adpcmA` hardware model. This is **ADPCM-A**, not the ADPCM-B codec used by the YM2608 example.

The generated source is an original 440 Hz sine with 5 ms source endpoint fades. Its PCM rate is **8,000,000 / 432 ≈ 18,518.5 samples/second**, exactly the decoded rate of ADPCM-A at this chip clock. The encoder does not resample, infer pitch, normalize volume, or add loops. Input is finite Float32 PCM in −1…+1.

ADPCM-A contains two decoded samples per byte, high nibble first. The encoded range is selected on a 256-byte boundary, with an exclusive aligned end. This example uses 16,384 source frames, producing 8,192 compressed bytes with no padding. A non-aligned recording would require the helper's explicit zero-target padding; zero-filled compressed bytes are not silence.

ADPCM-A has **no hardware pitch control or repeat flag**. It plays the selected ROM range once at clock/432. Changing pitch would require software resampling/re-encoding or a different chip clock. `keyOff(0)` is an explicit stop, not a loop command.

The engine renders stereo at 48 kHz with one host gain of 0.5. The hardware ADPCM-A level is also audible in the result; source and chip are not loudness-normalized. Web renders the real chip offline and plays an `AudioBuffer`, with source comparison, Stop and WAV export. Native core/ROM ownership ends before buffer playback. Stop aborts preparation and discards stale results.

```sh
node examples/neo-geo/adpcm-a/01-pcm-encode/node/main.mjs ./pcm-to-adpcm-a.wav
```

Node writes a 1.1-second PCM16 stereo WAV, checks sustained AC output and its 440 Hz pitch, and needs no audio device. The extra tail demonstrates that the range ends rather than repeating. Both Web and Node files contain all their own source, encoding and chip-render code. Only published npm APIs are reused.

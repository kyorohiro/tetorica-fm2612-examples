# MegaSynth：Node Worker リアルタイム

Worker 内で FM / nativeFX / 音声出力、recording、PCM looper、停止・再開を動かす。

公開済み `tetorica-fm2612@0.2.5` の実験 API を import します。
導入手順は [repository README](../../../README.md#megasynth-node-examples) を参照してください。

```sh
node examples/embedding/10-megasynth-node-audio/node/main.mjs
```

[全コード](node/main.mjs) は package export だけを import します。
この例だけは audify と音声デバイスが必要です。macOS / CoreAudio で検証します。通常再生の PCM は Main を通りません。第1引数は検証用の audify/index.js file URL です。

約9秒で、FM 発音 → イベントの繰り返し再生 → PCM looper → 停止後の再開を実演します。
各段階をターミナルに表示し、終了時に `Finished: audio device and Worker closed.` を表示します。
途中の `state: 'playing'` は正常な状態で、エラーではありません。
`masterVolume` は Browser 例と同じ0.25です。
保存先は `output/megasynth-realtime-events.json` と `output/megasynth-realtime-pcm.wav` です。

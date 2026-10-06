# MegaSynth：Node PCM looper

dry FM を PCM に録音し、native mixer / FX でループ再生して WAV を保存する。

公開済み `tetorica-fm2612@0.2.5` の実験 API を import します。
導入手順は [repository README](../../../README.md#megasynth-node-examples) を参照してください。

```sh
node examples/embedding/09-megasynth-node-pcm-looper/node/main.mjs
```

[全コード](node/main.mjs) は package export だけを import します。
音声デバイス不要。第1引数で WAV 保存先を指定できます。生成フレーム数で時計を進めます。 dry PCM と FX 適用後の WAV を別々に保存します。保持中と録音中の PCM は既定で合計60秒までです。

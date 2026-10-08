# MegaSynth：Node イベント録音

サンプル時計で音符を JSON に録音し、import / 再演して WAV を保存する。

公開済み `tetorica-fm2612@0.2.10` の実験 API を import します。
導入手順は [repository README](../../../README.md#megasynth-node-examples) を参照してください。

```sh
node examples/embedding/07-megasynth-node-recording/node/main.mjs
```

[全コード](node/main.mjs) は package export だけを import します。
音声デバイス不要。第1引数で WAV 保存先を指定できます。生成フレーム数で時計を進めます。

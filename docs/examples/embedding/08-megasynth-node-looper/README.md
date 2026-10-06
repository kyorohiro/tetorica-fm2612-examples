# MegaSynth：Node イベント looper

1周分の音符を録音し、繰り返し再演・undo・停止する。

公開済み `tetorica-fm2612@0.2.5` の実験 API を import します。
導入手順は [repository README](../../../README.md#megasynth-node-examples) を参照してください。

```sh
node examples/embedding/08-megasynth-node-looper/node/main.mjs
```

[全コード](node/main.mjs) は package export だけを import します。
音声デバイス不要。第1引数で WAV 保存先を指定できます。生成フレーム数で時計を進めます。

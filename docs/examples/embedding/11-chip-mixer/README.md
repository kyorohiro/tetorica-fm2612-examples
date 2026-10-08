# Chip Mixer：自動 ID と個別調整

2つの Game Boy を同じ `SoundChipMixer` に接続し、音量・Pan・Mute を個別に変更するブラウザー用の例です。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。

```javascript
const mixer = new SoundChipMixer();
const chip = await createSoundChip('gameboy', {
  execution: 'worklet', mixer, audioContext, signal,
});
mixer.set(chip.id, {volume: 0.28, pan: -0.5, muted: false});
```

`id` は省略できます。生成したオブジェクトの読み取り専用 `chip.id` をそのまま使います。
同じ種類のチップを複数生成しても、自動 ID は重複しません。固定名が必要な場合は `id` を指定できます。

Volume は線形倍率（0〜2）、Pan はステレオバランス（-1〜1）。Game Boy の初期音量は28%、他のチップは100%です。
`mixer.reset()` はすべてのチップを初期設定へ戻します。`mixer.reset(chip.id)` で1つだけ戻せます。

この例では同じ AudioContext を共有し、最後の GainNode で全体を40%にしています。
Stop・終了・エラー時には Transport、各 Chip、共有 AudioContext を解放します。
共有 `SoundChipMixer` はブラウザー出力用です。Direct の生 PCM と Node の音声デバイス出力は別の経路です。

# SID：共通factoryからPCM・WAVへ

`tetorica-fm2612@0.2.40`の共通`createSoundChip('sid')`を使うNode専用の最小例です。
modelを選び、TriangleのA4を0.5秒鳴らして、0.25秒のReleaseとともにWAVへ保存します。
音声デバイス、AudioContext、C64 CPU、ROM、SID曲は使いません。

```sh
npm install
npm run render:sid-factory
npm run render:sid-factory -- ./sid-6581.wav --model=6581
npm run render:sid-factory -- ./sid-8580.wav --model=8580
```

[全コード](node/main.mjs)は短い1ファイルです。直接実行もできます。

```sh
node examples/c64/sid/03-factory-wav/node/main.mjs ./sid.wav --model=both
```

既定の`both`は6581→8580 Previewの順に収録し、合計1.5秒になります。
出力先を省略すると`output/c64-sid-03-factory-wav.wav`です。
WAVは48,000 Hz・stereo PCM16で、SIDのmonoを左右へ同じ値で複製します。
ホストgain 0.35を1回だけ適用し、正規化しません。

## コードの要点

```js
const core = await createSoundChip('sid', {model: '8580', sampleRate: 48000});
const sid = new SidSynth({core});
```

- 共通factoryの既定modelは`6581`です。`8580`はPreviewで、PAL 985,248 Hzのみ対応します。
- factoryは低レベルの既存`SidCore`／`Sid8580Core`を返します。WASMはnpm内のmodel別assetから読み込まれ、発音はまだ始まりません。
- `SidSynth`の`initialize()`、`setVoice()`、`noteOn()`で音色とGateを設定します。CHは0〜2で、この例はCH 0だけを使います。
- ADSRの値は0〜15のハードウェアコードです。秒数ではありません。
- `core.render(frames)`で時間が進み、所有権を持つ`Float32Array`のPCMが返ります。`sampleRate`は数値のプロパティです。`generateStereo()`／`sampleRate()`を使う他chipとは戻り値の契約が異なります。
- `noteOff()`でGateを下げたあとも`render()`を呼んでReleaseを収録します。sleepやタイマーは不要です。
- `SidSynth`はcoreを借りるため、最後に両方を`dispose()`します。独自の演奏割当helperは加えていません。

WAVは必要なときに自分のプレイヤーで開いて聴けます。検証コマンドは音声を出しません。

```sh
npm run check:node -- --only=sid
```

同じ音色をWebで試す場合は[3ボイス・モデル比較](../01-voices/README.md)、
Filterは[共有Filter](../02-filter/README.md)を参照してください。
それらは専用のWeb Audio clientを使う別の入口です。

[repository README](../../../../README.md)

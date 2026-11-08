# SID：3ボイス・ADSR・モデル比較

公開済み `tetorica-fm2612@0.2.37` の専用SID APIを使います。
Triangle・Saw・Pulseの3ボイスを1つずつ鳴らした後、同じ音を重ねます。
6581と8580 Previewを、同じPALクロック・音色設定・出力gainで比較できます。
コード内の短いオリジナル音列だけを使い、C64 CPU・ROM・SID曲は不要です。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行して開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーを使ってください。

Modelを選び、Playを押します。コードを編集すると次のPlayに反映されます。
モデルの変更はStop後に行います。各Playは新しい音源とAudioContextを作り、
終了・エラー・Stop・ページ移動時に解放します。読み込み中のStopも受け付けます。

`createSidAudio(context, destination, {model, signal})` がWASMとAudioWorkletを用意し、
`createSidClient(endpoint.port, {model, clock})` が高水準のボイス操作を提供します。
`startAudio()` はこの例の中だけの初期化関数です。`sid.initialize()` 後に
`setVoice()`・`noteOn()`・`keyOff()` を呼びます。
SIDクロックとPCM生成はAudioWorklet内で進み、UIのタイマーは発音時刻だけを扱います。
汎用 `createSoundChip('sid')` やPlaygroundのWorkerは使いません。

## Node

```sh
node examples/c64/sid/01-voices/node/main.mjs
node examples/c64/sid/01-voices/node/main.mjs ./sid-6581.wav --model=6581
node examples/c64/sid/01-voices/node/main.mjs ./sid-8580.wav --model=8580
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`SidCore.create({wasmBinary})` または `Sid8580Core.create({wasmBinary})` に
パッケージのWASMを渡し、`new SidSynth({core})` へ接続します。
`core.render(frames)` が時間を進めるため、sleepや音声ドライバーは不要です。
Synthはcoreを借りるので、両方を明示的にdisposeします。

既定の `--model=both` は6581→8580の順に各4.05秒、合計8.1秒を収録します。
出力先を省略すると `output/c64-sid-01-voices.wav` です。
48,000 Hz・stereo PCM16 WAVへ、SIDのmonoを左右同じ値で保存します。
Web / Nodeともホストgain 0.35を1回だけ適用し、正規化しません。

## 音源の要点

- 3つの物理ボイスはAPIで0〜2。各ボイスに波形・周波数・Pulse width・ADSRがあります。
- ADSRのAttack / Decay / Sustain / Releaseは各0〜15のハードウェアコードです。秒数ではありません。
- `noteOn()` は音程とGateを設定し、`keyOff()` はGateを下げてReleaseへ進めます。Gateを下げても発振器の位相は進みます。
- Saw・Triangle・Pulseはそれぞれ別のボイスで鳴らします。この例はNoise・Sync・Ringを使いません。
- SIDはmonoです。3ボイスを左右別々にパンする機能はありません。
- 6581は近似モデル、8580はPreviewです。両者の音量・波形・フィルター特性の違いを残して比較します。
- 共通の12 Hz DC blockerは出力側のソフトウェア処理で、プログラム可能なSIDフィルターとは別です。

このフォルダーだけで初期化・演奏・停止・解放を確認できます。
音源処理を別サンプルや共通ヘルパーへ委譲していません。
ライセンス・対応ソース・再ビルド手順はnpm内の `sources/SID.md` と `sources/SID8580.md` を参照してください。

[repository README](../../../../README.md) / [共有フィルターの例](../02-filter/README.md)

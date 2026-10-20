# PC Engine：CH4／5のノイズ

ノイズ対応のCH4／5で周波数コード8・20・28を比較し、CH4は左、CH5は右から鳴らします。

公開済み `tetorica-fm2612@0.2.21` のHuC6280 APIを使用します。
波形はコードで生成し、ゲームの音声データ・ROMは使用しません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行し、一覧から開きます。
Main / Workerを選び、編集欄のコードをPlayで演奏できます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

ホストの `Playground({chip: 'huc6280'})` がPC Engineの主音源を作ります。
`pce` と `beat()` は `pg.load()` したスクリプト内のグローバルです。
`useSoundChip('huc6280')` でも同じ主音源を取得できます。
YM2612やSega PSGを追加する必要はありません。

各例は初期化・演奏・停止・解放まで独立したファイルに記述しています。
演奏は有限で、終了時は `finalize()` で解放します。読み込み中のStopも受け付け、
初期化が完了してから解放することで、遅れて作られた音声ノードも閉じます。
Workerは先読み予約を使うため、最後の離鍵の後に2拍の待機を置いています。

## Node

```sh
node examples/pc-engine/noise/01-noise/node/main.mjs
node examples/pc-engine/noise/01-noise/node/main.mjs ./pc-engine-noise-01-noise.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`Huc6280AudioEngine` → `Huc6280DirectTransport` → `Huc6280Synth` と接続し、
`initialize()` してから同じ音源操作を行います。
`processFrames()` がチップの時間を進めるため、Webの `beat()` に相当する区間を
フレーム数に変換して生成します。リアルタイムのsleepは不要です。

`encodeWav()` で44,100 Hzのstereo PCM16 WAVに保存します。
出力先を省略すると `output/pc-engine-noise-01-noise.wav` です。
AudioContext・audify・音声デバイスは使用しません。
チップは3,579,545 HzのPSG入力クロックで動きます。WAVのサンプルレートとは別の値です。

## APIの要点

- ノイズは物理 **CH4とCH5だけ**で使用できます。CH番号は0始まりです。
- `setNoise(channel, {enabled: true, frequency})` の `frequency` は **0〜31のハードウェアコード**で、Hz指定ではありません。大きい値ほどノイズの更新が速くなります。
- `keyOn(channel)` で発音し、`keyOff(channel)` で止めます。`noteOn()` の音程はノイズ速度を指定するものではありません。
- CH4を左、CH5を右に設定し、各CHで8→20→28と同じコードを比較します。左右の音量は0〜15です。
- `setNoise(channel, {enabled: false})` で波形モードに戻します。波形メモリーの内容は保持されます。
- ノイズは乱数列に基づく音です。ドレミのような音階ではなく、ざらつきと速さの違いを聞き比べます。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

HuC6280エンジンはBSD-3-ClauseのMAME由来コードを使用します。
ライセンスと出典はnpm package内の `licenses/mame-huc6280/` に同梱されています。

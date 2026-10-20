# PC Engine：32点波形とステレオ

32点・各0〜31のサイン波、三角波、ノコギリ波で同じメロディーを鳴らし、左右のパンも比較します。

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
node examples/pc-engine/wave/01-waveform/node/main.mjs
node examples/pc-engine/wave/01-waveform/node/main.mjs ./pc-engine-wave-01-waveform.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`Huc6280AudioEngine` → `Huc6280DirectTransport` → `Huc6280Synth` と接続し、
`initialize()` してから同じ音源操作を行います。
`processFrames()` がチップの時間を進めるため、Webの `beat()` に相当する区間を
フレーム数に変換して生成します。リアルタイムのsleepは不要です。

`encodeWav()` で44,100 Hzのstereo PCM16 WAVに保存します。
出力先を省略すると `output/pc-engine-wave-01-waveform.wav` です。
AudioContext・audify・音声デバイスは使用しません。
チップは3,579,545 HzのPSG入力クロックで動きます。WAVのサンプルレートとは別の値です。

## APIの要点

- 波形は必ず **32点の整数0〜31**。これはサンプラーのPCMファイルではなく、繰り返す1周期の波形です。
- 物理チャンネルは0〜5。この例はCH0だけを使います。
- `setWaveform()` は対象CHを停止して波形ポインターをリセットします。更新後は `noteOn()` または `keyOn()` が必要です。
- `setVolume(channel, level)` は0〜31、`setPan(channel, left, right)` は左右それぞれ0〜15。0は無音、最大値は最大音量です。
- サイン波は左、三角波は中央、ノコギリ波は右から聞こえます。ヘッドフォンで比較できます。
- `noteOn()` の音名は `A4 = 440 Hz`。12-bitのハードウェア周期に丸められるため、指定した周波数とわずかに異なる場合があります。
- 発音中の音程変更は波形を維持します。波形を入れ替える境界ではチップ本来の段差が生じる場合があります。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

HuC6280エンジンはBSD-3-ClauseのMAME由来コードを使用します。
ライセンスと出典はnpm package内の `licenses/mame-huc6280/` に同梱されています。

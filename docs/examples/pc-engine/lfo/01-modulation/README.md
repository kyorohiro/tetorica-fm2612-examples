# PC Engine：波形LFOの変調

CH0のサイン波をCH1の三角波で変調し、LFO depth 0と1を比較します。変調元CH1の音量は0にします。

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
node examples/pc-engine/lfo/01-modulation/node/main.mjs
node examples/pc-engine/lfo/01-modulation/node/main.mjs ./pc-engine-lfo-01-modulation.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`Huc6280AudioEngine` → `Huc6280DirectTransport` → `Huc6280Synth` と接続し、
`initialize()` してから同じ音源操作を行います。
`processFrames()` がチップの時間を進めるため、Webの `beat()` に相当する区間を
フレーム数に変換して生成します。リアルタイムのsleepは不要です。

`encodeWav()` で44,100 Hzのstereo PCM16 WAVに保存します。
出力先を省略すると `output/pc-engine-lfo-01-modulation.wav` です。
AudioContext・audify・音声デバイスは使用しません。
チップは3,579,545 HzのPSG入力クロックで動きます。WAVのサンプルレートとは別の値です。

## APIの要点

- ハードウェアLFOは **CH1の波形でCH0の周期を変調**します。他のCHへ割り当てる機能ではありません。
- CH0は聞こえるサイン波、CH1は変調用の三角波。`setVolume(1, 0)` で変調元の音声出力だけを消します。
- `depth` は0〜3。0は無効、1〜3は変調量のハードウェア設定です。この例は0と1だけを比較します。
- `frequency` は0〜255のレジスタ値でHzではありません。CH1の周期と掛け合わせて変調速度が決まります。この例ではCH1をC3、frequencyを24にし、約5.5 Hzの変調になります。
- `reset: true` はLFOをリセット状態に保持します。`reset: false` に戻すと進みます。
- CH1に波形をアップロードするとCH1の発音は停止しますが、LFOはCH0が有効な間にCH1の波形を読みます。CH1を音として発音する必要はありません。
- WebもNodeも3音をdepth 0→1の順で演奏します。最後にLFOを無効にして全CHを停止します。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

HuC6280エンジンはBSD-3-ClauseのMAME由来コードを使用します。
ライセンスと出典はnpm package内の `licenses/mame-huc6280/` に同梱されています。

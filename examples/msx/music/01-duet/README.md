# MSX：PSGとMSX-MUSICの合奏

PSGのベースとMSX-MUSICのPianoを、独立した2チップで合奏します。
公開済み `tetorica-fm2612@0.2.23` のAPIだけを使います。フレーズはこの例のためのオリジナルです。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行し、一覧から開きます。
Main / Workerを選び、コードを編集してPlayで演奏できます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。

`createPlaygroundRuntime({chip: 'msx'})` が構成内の独立した主音源をまとめて作ります。
`ay`、`opll`、`beat()`、`mixer` は読み込んだPlaygroundスクリプトのグローバルです。
`useSoundChip('ay8910')` / `useSoundChip('ym2413')` を使っても同じ主音源を借りるため、音声ノードを追加生成しません。
各チップの物理チャンネルは0から数え、この例は各CH0を使います。

約5秒の有限の演奏です。最後の2拍はFMの余韻とWorker先読み予約が届くための待機です。
終了・Stop後は `finalize()` でWorker、チップ、AudioContextを解放します。
読み込み中のStopは主音源の初期化も中断し、閉じた後のPlayは新しい実行を開始します。
編集中の変更は次のPlayに反映されます。ページを開くだけでは音声を開始しません。

## Node

```sh
node examples/msx/music/01-duet/node/main.mjs
node examples/msx/music/01-duet/node/main.mjs ./msx-music-01-duet.wav
```

[全コード](node/main.mjs)。Node.js 22以降で44,100 Hzのstereo PCM16 WAVを生成します。
省略時の出力先は `output/msx-music-01-duet.wav` です。audifyや音声デバイスは不要です。

`createSoundChip()` で各チップを作り、対応する `DirectTransport` と `Synth` を接続します。
AYは44,100 Hz、FMチップはクロックから決まるnative PCM rateを持ちます。
**各音源の `ChipPCMRenderer` で共通の44,100 Hzへ変換した後**に合算します。
rendererごとの変換位相と、累積フレーム数による拍の丸めを演奏全体で維持します。
チップクロックをWAVのサンプルレートとして扱ったり、異なるrateの配列をそのまま足したりしません。
AYの音量0のCHはspeaker transport同様にmuteし、無音時のDACオフセットを混ぜません。
終了時は `finally` で各native handleを解放します。

## 音源について

MSXはPSGとMSX-MUSICをまとめた音源セットです。AY-3-8910は1,789,773 Hz、YM2413は3,579,545 Hzで動きます。
YM2413のinstrument 1..15はチップ内蔵音色で、この例はPiano（3）を使用します。
instrument 0を使う場合、8バイトのユーザーパッチは全instrument-0 CHで共有します。
AYの3CHは1つのノイズ発生器と1つのハードウェアエンベロープを共有します。
この例では音量固定のtoneを使います。音名は `A4 = MIDI 69 = 440 Hz` です。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

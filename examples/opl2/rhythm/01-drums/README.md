# OPL2：5つのリズム音

YM3812のリズムモードでバスドラム、スネア、タム、シンバル、ハイハットを個別に鳴らし、短いパターンにつなげます。
`tetorica-fm2612@0.2.22` の `OPLSynth` を使う独立した例です。音色はコードで設定し、PCMサンプルや外部ROMは使いません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

`createSoundChip('ym3812', {execution: 'worklet', audioContext})` → `OPLWorkletTransport` → `OPLSynth` と接続します。
編集欄では `opl`、`OPL_PRESETS`、秒指定の `sleep()`、`console` を使えます。編集内容は次のPlayで実行します。
ページを開くだけではAudioContextを作りません。演奏は有限で、終了・Stop時はWorkletとAudioContextを解放します。
読み込み中のStopも受け付けます。

## Node

```sh
node examples/opl2/rhythm/01-drums/node/main.mjs
node examples/opl2/rhythm/01-drums/node/main.mjs ./opl2-rhythm-01-drums.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`createSoundChip('ym3812')` → `OPLDirectTransport` → `OPLSynth` と接続し、同じリズムをWAVへ保存します。
AudioContext・audify・音声デバイスは不要です。生成したPCMはstereo形式で、左右に同じmono音声を入れます。

チップのnative sample rateは入力クロック3,579,545 Hzを基にした約49.7 kHzです。実際の `transport.sampleRate()` をWAVヘッダーと時間の計算に使い、
累積フレーム数を丸めて音符ごとの端数を保持します。出力先を省略すると `output/opl2-rhythm-01-drums.wav` です。

## APIの要点

- CH番号は0始まりです。リズムモードは物理CH6〜8を使用します。
- CH6の2オペレーターがバスドラム、CH7がハイハット／スネア、CH8がタム／シンバルです。
- `setRhythm({enabled: true})` で切り替え、`setRhythm({snare: true})` で発音、`setRhythm({snare: false})` で離鍵します。各フィールドは部分更新です。
- Rhythm有効中、CH6〜8は通常の `noteOn()` に使えません。音程やオペレーターの設定はリズム切替前に準備します。
- 同じチャンネルの2音はF-NUM／BLOCKを共有します。ノイズを使う音色もあり、すべてがドレミに追従するわけではありません。
- 最後に `allNotesOff()` と `setRhythm({enabled: false})` でトリガーを解放し、短い余韻を生成します。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

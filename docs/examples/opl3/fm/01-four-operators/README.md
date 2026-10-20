# OPL3：4オペレーターとステレオ

YMF262の4-opペアを2つ作り、4種類の接続アルゴリズムを左・右の順に聴き比べます。
`tetorica-fm2612@0.2.22` の `OPLSynth` と自作 `OPL_PRESETS` を使います。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

`createSoundChip('ymf262', {execution: 'worklet', audioContext})` → `OPLWorkletTransport` → `OPLSynth` と接続します。
編集欄では `opl`、`OPL_PRESETS`、秒指定の `sleep()`、`console` を使えます。編集は次のPlayに反映されます。
チップのPCM生成はAudioWorkletで進み、JavaScriptの `sleep()` は音符の切替だけを待ちます。
ページを開くだけではAudioContextを作りません。終了・StopでWorkletとAudioContextを解放し、読み込み中のStopにも対応します。

## Node

```sh
node examples/opl3/fm/01-four-operators/node/main.mjs
node examples/opl3/fm/01-four-operators/node/main.mjs ./opl3-fm-01-four-operators.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`createSoundChip('ymf262')` → `OPLDirectTransport` → `OPLSynth` と接続し、約4秒のstereo PCM16 WAVを生成します。
音声デバイス・AudioContext・audifyは不要です。出力先を省略すると `output/opl3-fm-01-four-operators.wav` です。

入力クロックは14,318,180 Hzで、PCMはnative sample rateの約49.7 kHzです。
`transport.sampleRate()` をWAVヘッダーと音符区間の累積フレーム数に使います。クロックHzとWAVのsample rateは別の値です。

## APIの要点

- チャンネル・オペレーター番号は0始まりです。4-opのprimaryは **0・1・2・9・10・11**、secondaryはそれぞれ **primary＋3** です。
- この例はCH0＋3を左、CH9＋12を右に使います。ペアのsecondaryは独立した音源として使えません。
- `setPreset(primary, OPL_PRESETS['four-op-bell'])` で4-opに切り替え、`setOperator(primary, 0..3, patch)` で4つのオペレーターを編集します。
- `setAlgo(primary, algorithm, feedback)` のalgorithmは0〜3で、次の経路を切り替えます。

| Algorithm | 接続 |
| --- | --- |
| 0 | OP1 → OP2 → OP3 → OP4 |
| 1 | OP1 ＋ (OP2 → OP3 → OP4) |
| 2 | (OP1 → OP2) ＋ (OP3 → OP4) |
| 3 | OP1 ＋ (OP2 → OP3) ＋ OP4 |

- `setPan(primary, left, right)` は左右の出力スイッチです。連続したPan値ではありません。
- 発音・音程・離鍵はprimaryへ送り、演奏後は `setFourOp(primary, false)` で独立した2-opに戻せます。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

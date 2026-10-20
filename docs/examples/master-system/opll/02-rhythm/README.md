# Master System：OPLLの5つのリズム音

`tetorica-fm2612@0.2.23` の `YM2413Synth` で、9CHのメロディーから6CH＋5つのリズム音へ切り替えます。
バスドラム、スネア、タム、シンバル、ハイハットを個別に鳴らしてから、CH0のメロディーを重ねた短いパターンを演奏します。
最後にリズムモードを解除し、CH8の内蔵音色を設定し直して9CHのメロディー構成へ戻します。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

`createSoundChip('ym2413', {execution:'worklet', audioContext})` → `YM2413WorkletTransport` → `YM2413Synth` と接続します。
編集欄では `opll`、`OPLL_INSTRUMENTS`、`OPLL_USER_PRESETS`、`sleep(秒)`、`console` を使えます。
PCMの時間はWorklet内で進み、ページのtimerは音符・トリガーだけを切り替えます。
ページを開くだけでは音声を開始しません。演奏は有限で、終了・Stop時はWorkletとAudioContextを解放します。
読み込み中のStopにも対応します。この例ではOPLLの説明に集中し、Sega PSGは準備しません。

## Node

```sh
node examples/master-system/opll/02-rhythm/node/main.mjs
node examples/master-system/opll/02-rhythm/node/main.mjs ./opll-rhythm.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`YM2413DirectTransport` のnative PCMを `ChipPCMRenderer` で44,100 Hzへ揃えてWAVに保存します。
累積フレーム数で音符の端数を保持し、音声デバイス・AudioContext・audifyを使いません。
出力先を省略すると `output/master-system-opll-02-rhythm.wav` です。
左右に同じmono音声を入れ、出力gainと各drumのattenuationを下げています。

## APIの要点

CH番号は0始まりです。リズムモードでは物理CH6〜8の2オペレーターずつを次の5音に使います。

| 物理CH | 用途 |
| --- | --- |
| 0〜5 | 通常のメロディー |
| 6 | バスドラム |
| 7 | ハイハット／スネア |
| 8 | タム／シンバル |

- `setRhythm({enabled:true})` で切り替え、`setRhythm({snare:true})`／`{snare:false}` で発音・離鍵します。部分更新です。
- Rhythm有効中はCH6〜8の通常 `noteOn()`／音色設定を使えません。`setNote()`／`setPitch()` は物理drumの周波数を調整できます。
- ハイハット／スネア、タム／シンバルは物理CHを共有します。すべての打楽器が音名どおりに鳴るわけではありません。
- `setRhythmLevels()` は0が最大、15が最小のattenuationを設定します。HH／Tomの値は、melody時のCH7／8のinstrument番号と同じレジスターを使います。
- `setRhythm({enabled:false})` だけでは以前のメロディー音色を復元しません。例の最後では `setVoice(8, …)` を明示しています。
- A4 = MIDI 69 = 440 Hz。外部ROM・PCMサンプルは不要です。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

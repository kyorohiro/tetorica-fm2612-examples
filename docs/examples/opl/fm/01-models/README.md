# OPL family：4モデルの基本発音

`tetorica-fm2612@0.2.22` の `OPLSynth` で、YM3526（OPL）、YM3812（OPL2）、Y8950のFM部分、YMF262（OPL3）を同じコードで鳴らします。

- `initialize()` で明示的に初期化し、`setPreset()`、`setOperator()`、`noteOn()`／`noteOff()` を使います。
- チャンネルと論理オペレーター番号は0始まりです。2-opのoperator 0がモジュレーター、1がキャリアです。
- A4とMIDI 69は440 Hzです。`clock` を省略すると各チップの標準クロックを使います。
- YM3526／Y8950のFM部分はサイン波のみ、YM3812は4波形、YMF262は8波形を持ちます。この例は全モデル共通のサイン波ベースのプリセットを使います。
- YM3526／YM3812／Y8950のFM部分は9物理CH・モノラルです。YMF262は18物理CH・ステレオです。Y8950のADPCMはこの例に含みません。

Webでは一覧からページを開き、Chipを選んでPlayを押します。コード欄には `opl`、`OPL_PRESETS`、`sleep(seconds)`、`console` が渡されます。編集内容とチップ選択は次のPlayに反映されます。

Webの音源経路は `createSoundChip(kind, {execution: 'worklet', audioContext})` → `OPLWorkletTransport` → `OPLSynth` です。ページを開くだけでは音声リソースを作りません。Play時に作成し、読み込み中のStopにも対応します。終了時はエンドポイントと、呼び出し側が所有するAudioContextの両方を閉じます。連続したPCM生成はAudioWorkletが担当し、Mainのタイマーは音符の長さだけを決めます。

Nodeは音声デバイス不要のWAV出力です。第1引数は出力先、第2引数はチップ名です。

```sh
node examples/opl/fm/01-models/node/main.mjs
node examples/opl/fm/01-models/node/main.mjs ./ym3526.wav ym3526
node examples/opl/fm/01-models/node/main.mjs ./ym3812.wav ym3812
node examples/opl/fm/01-models/node/main.mjs ./y8950.wav y8950
node examples/opl/fm/01-models/node/main.mjs ./ymf262.wav ymf262
```

省略時は `output/opl-models.wav` にYM3812で保存します。`OPLDirectTransport` が借りたチップから、ネイティブレート（約49.7 kHz）のstereo PCM16 WAVを生成します。モノラルチップの音は左右へ同じ値を出します。元チップを最後に `dispose()` します。

各Web／Nodeファイルは独立した全コードを含みます。音色はパッケージのオリジナルプリセットで、外部音源データは不要です。

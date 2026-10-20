# OPL2：オペレーター・波形・LFO

`tetorica-fm2612@0.2.22` の `OPLSynth` で、YM3812（OPL2）の音色を変更します。WebとNodeの両方を用意しています。

1. 同じ2オペレーターを、algorithm 0のFM接続とalgorithm 1の加算接続で比較します。
2. キャリアのwaveform 0〜3（サイン、半波、絶対値、四分の一波）を鳴らします。
3. ハードウェアLFOのAMとvibratoを深い設定で試します。

物理チャンネルと論理オペレーター番号は0始まりです。CH0のoperator 0がモジュレーター、1がキャリアです。TLは0が最大、63が最小で、モジュレーターのTLはFM接続時の音色にも影響します。`setOperator()` は指定していないビットを保持する部分更新です。

`initialize()` はリセットに加え、YM3812の波形選択を有効にします。LFOの速度は固定です。`setLFO({amDepth, pmDepth})` は全体の深さを変更し、`setOperator(..., {am, vibrato})` で対象オペレーターへ適用します。OPL2はモノラルなので、出力を左右へ同じ値で送ります。

Webは一覧からページを開き、Playを押してください。`opl`、`OPL_PRESETS`、`sleep(seconds)`、`console` を使ってコードを変更できます。Mainで音符を操作し、`createSoundChip('ym3812', {execution: 'worklet', audioContext})` と `OPLWorkletTransport` によりAudioWorkletで連続してPCMを生成します。初期化中のStop、演奏の終了・失敗時も音源とAudioContextを解放します。

Nodeは音声デバイスを使わず、DirectTransportでネイティブレート（約49.7 kHz）のstereo PCM16 WAVを生成します。

```sh
node examples/opl2/fm/01-operators/node/main.mjs
node examples/opl2/fm/01-operators/node/main.mjs ./opl2-operators.wav
```

省略時の出力先は `output/opl2-operators.wav` です。Web／Nodeとも約4.6秒の有限の演奏で、最後にリリース時間を取ります。外部音源データや共通の再生ヘルパーは不要です。

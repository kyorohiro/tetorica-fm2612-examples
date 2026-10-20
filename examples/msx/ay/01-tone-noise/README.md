# MSX AY：3つのToneと共有Noise

公開済み `tetorica-fm2612@0.2.23` の `AY8910Synth` で、AY-3-8910を鳴らします。WebとNodeの独立した全コードを用意しています。

- 最初にA4（MIDI 69、440 Hz）を鳴らし、3つの物理CHで和音を作ります。
- CH0とCH1をNoiseに切り替え、共有Noiseの周期を変更します。
- 最後にCH0でToneとNoiseを混ぜます。

物理CHは0〜2です。それぞれがToneとNoiseを組み合わせ、Volumeは0が無音、15が最大です。Noise生成器はチップ全体に1つだけで、独立した第4のNoise CHはありません。`setNoisePeriod(0..31)` の変更はNoiseを有効にした全CHへ反映されます。

`tone(ch, {note, volume})` はToneのみ、`noise(ch, {period, volume})` はNoiseのみを有効にします。`setVoice()`／`setMixer()` なら両方を有効にできます。Tone周期は12-bitで、`frequency = inputClock / (16 * period)`。Noise周期は別の5-bit値です。

`initialize()` は明示的にリセットし、無音から始めます。`keyOff()` は設定済み音量とTone／Noiseの組み合わせを保持し、`keyOn()` がその音を再開します。Noiseのみの音に `noteOn()` してもNoise周期は変わりません。高級APIの生成だけでは借りたチップへ書き込みません。

Webは一覧からページを開き、Playを押してください。コード欄の `ay`、`sleep(seconds)`、`console` を使って編集できます。編集は次のPlayに反映されます。音声生成は `createSoundChip('ay8910', {execution:'worklet'})` → `AY8910WorkletTransport` → `AY8910Synth` でAudioWorkletへ置き、Mainのタイマーは音符の長さだけを決めます。読み込み中のStop、実行失敗、正常終了でもエンドポイントとAudioContextを解放します。

Nodeは44,100 HzのPCMから、左右同じ音のstereo PCM16 WAVを作ります。音声デバイスやaudifyは不要です。

```sh
node examples/msx/ay/01-tone-noise/node/main.mjs
node examples/msx/ay/01-tone-noise/node/main.mjs ./ay-tone-noise.wav
```

省略時は `output/msx-ay-tone-noise.wav` へ保存します。入力クロック1,789,773 HzとPCM出力レート44,100 Hzは別の値です。AYのnative DACが持つDC成分をWAVへ残さないため、Node版は出力整形として20 HzのDC除去と先頭・末尾5 msのフェードを適用します。音源のレジスタ操作はWebと同じです。録音済み音源や外部素材は不要です。

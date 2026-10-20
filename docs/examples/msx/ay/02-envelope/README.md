# MSX AY：共有ハードウェアEnvelope

公開済み `tetorica-fm2612@0.2.23` の `AY8910Synth` で、2つのToneへ同じハードウェアEnvelopeを掛けます。C4とG4を鳴らしながら、周期変更とShape書き込みの違いを比較します。

AYのEnvelope生成器はチップ全体に1つです。各CHの `envelope:true` は固定Volumeを共有Envelopeへ切り替えます。Envelope有効時には各CHの固定Volume値で個別の強弱を付けられません。

- `setEnvelope({period:1200, shape:10})`：共有Envelopeの周期と波形を設定します。
- `setEnvelope({period:2400})`：周期だけを更新し、位相を維持します。
- `setEnvelope({shape:12})`：Shapeを書き込み、全Envelope使用CHを同時に再開始します。同じShapeの再書き込みでも再開始します。
- `allNotesOff()`：Envelope使用CHも停止します。

Periodは0〜65,535のハードウェア値で、秒やHzではありません。Shapeは0〜15です。この例の10／14は繰り返す三角形、12は繰り返す上昇ランプです。Envelope、Noise、各CHのTone周期は別の設定です。物理CHは0〜2、通常のVolumeは0が無音、15が最大で、音名はA4＝MIDI 69＝440 Hzです。

Webは一覧からページを開き、Playを押します。`ay`、`sleep(seconds)`、`console` を使ってコードを編集できます。音声の連続生成はAudioWorkletで行い、Mainは音色や音符の操作だけを担当します。ページを開くだけでは音声リソースを作らず、読み込み中のStopや実行失敗にも対応し、終了時はエンドポイントとAudioContextを解放します。

NodeはDirectTransportでサンプル時刻を進めてWAVを書き出します。壁時計のタイマーや音声デバイスは不要です。

```sh
node examples/msx/ay/02-envelope/node/main.mjs
node examples/msx/ay/02-envelope/node/main.mjs ./ay-envelope.wav
```

省略時は `output/msx-ay-envelope.wav` です。入力クロックは1,789,773 Hz、PCMは44,100 Hzのstereo PCM16で、左右へ同じモノラル音を送ります。native DACのDC成分を除く20 Hzフィルターと先頭・末尾5 msのフェードを、Nodeの出力整形として明示的に適用します。共有の再生ヘルパーや外部音源データは使いません。

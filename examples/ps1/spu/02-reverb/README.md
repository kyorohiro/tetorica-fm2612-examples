# SPU：個別Sendと共有リバーブ

公開済み `tetorica-fm2612@0.2.39` で、自作の0.4秒・220 Hzの減衰PCMをソフトウェアでADPCMへ符号化し、
2ボイスの個別Sendと1つの共有SPU Reverbを試します。
ゲーム由来のデータ・ROM・PS1 CPUは使いません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev`。HTTPSまたはlocalhostとAudioWorklet対応ブラウザーを使います。

Playすると短い2音を繰り返し、離鍵後の残響を聴けます。
CH1のSendだけが初期Onで、CH2はdryです。演奏中に次を変更できます。

- 各ボイスのSend（dry音はそのまま）
- 1つのShared presetとEnable
- 左右それぞれのReturn level

Returnは元のdry音へwet音を加算します。0にしてもdry音は消えません。
SendをOffにしても既存の残響は続きます。
StopはSPUとAudioContextを解放するため、残響も直ちに消えます。
プリセットは実装による**実機リバーブの近似**で、別のWeb Audioエフェクトではありません。

`createPs1Audio()` → `createPs1Client()` の専用AudioWorkletを使います。
コード欄の `applyControls()` はこのファイル内でUI値を読み、`setReverb()` と
`setPreset(channel, {reverb})` へ送ります。編集したコードは次のPlayに反映されます。
初期化中のStop・終了・エラー・ページ移動でリソースを解放します。

## Node

```sh
node examples/ps1/spu/02-reverb/node/main.mjs
node examples/ps1/spu/02-reverb/node/main.mjs ./spu-reverb.wav
```

[全コード](node/main.mjs)。`Ps1Spu` / `Ps1Synth` を直接使ってPCMを生成します。
AudioContext・音声デバイス・audifyは不要です。
同じ2音を各1秒の区間で比較します。

1. Dry、Sendなし
2. Room、CH1 Send、左Returnのみ
3. Room、CH2 Send、右Returnのみ
4. Room、両Send、両Return
5. Hall、CH1 Send、左右のReturnを別の値へ

各区間は0.25秒の発音と0.75秒のRelease / 残響です。
比較の境界では `stopVoices()` で古い残響を消し、RAM・sample ID・Voice presetを保持します。
最後のStop後に0.2秒の完全な無音を付け、44,100 Hz stereo PCM16・5.2秒を保存します。
既定の保存先は `output/ps1-spu-02-reverb.wav` です。

`encodePs1Adpcm()` は有限長の録音をソフトウェアで符号化します。基準音程は220 Hzで、末尾は完全な28-frameパケットへゼロ詰めされます。ループせず、key-offまたはサンプル終端でdry音が止まります。
各Voice volume 0.18で**内部加算前**に余裕を作り、host gain 0.6を1回だけ掛けます。
Masterを下げるだけでは内部の飽和を取り除けないためです。正規化はしません。

24ボイスは共通の1つのリバーブを使います。ボイスごとに別のpresetを割り当てる機能ではありません。
SPUのnative出力は44,100 Hzで、Webのデバイス出力時だけリサンプリングします。
対応ソースとBSDライセンスはnpm内の `sources/PS1-SPU.md` と `licenses/mame-ps1-spu/` を参照してください。

[サンプルとADSRの例](../01-sample-adsr/README.md) / [repository README](../../../../README.md)

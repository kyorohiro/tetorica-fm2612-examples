# SPU：自作サンプルとLive ADSR

公開済み `tetorica-fm2612@0.2.39` だけを使う、独立したWeb / Node例です。
112点の自作サイン波を **ソフトウェアで** SPU ADPCMへ変換してから再生します。
WAV・ゲーム音色・ROM・PS1 CPUは不要です。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行します。HTTPSまたはlocalhostと、
AudioWorklet対応ブラウザーが必要です。

PlayでA4を4秒鳴らした後、C4・E4・G4を鳴らします。コードを編集して再実行できます。
Sustain rateを127から64に下げると、保持中の音がゆっくり減衰します。
ADSRをlive更新してもサンプルや音量の現在値をリセットしません。
Attackの変更は次の発音、Releaseの変更は次の離鍵で聞きます。

`createPs1Audio()` と `createPs1Client()` が専用のSPU AudioWorkletへ接続します。
エンコーダーはUI側で実行し、準備済みADPCMだけを音声スレッドへ送ります。
初期化中もStopでき、遅れて生成されたノードも解放します。
終了・エラー・ページ移動時にSPUとAudioContextを閉じます。
汎用チップfactoryや他のサンプルの音声ヘルパーには依存しません。

## Node

```sh
node examples/ps1/spu/01-sample-adsr/node/main.mjs
node examples/ps1/spu/01-sample-adsr/node/main.mjs ./spu-sample.wav
```

[全コード](node/main.mjs)。`Ps1Spu.create()` へパッケージのfactoryとWASMを渡し、
`new Ps1Synth({core})` で音色を設定します。
`core.generateStereo()` が時間を進め、AudioContext・音声デバイス・audifyは使いません。

NodeではA4の保持中にSustain rateを自動で127→64→127へ変更し、
続いて3音を鳴らします。コンソールのenvelope値はlive更新による減衰を示します。
最後に `stopVoices()` で状態を止め、0.2秒の完全な無音を付けます。
44,100 Hz stereo PCM16・4.2秒。既定の保存先は `output/ps1-spu-01-sample-adsr.wav` です。

同じNodeファイル内でSample Editor用の補助APIも示します。
`renderPs1SampleComparison()` はソフトウェアでパケットを復号し、表示用波形と誤差を返します。
`renderPs1SamplePreview()` は別の実SPUインスタンスで0.85秒を試奏し、直ちに解放します。
この試奏PCMはWAVへ連結せず、演奏用インスタンスも変更しません。
元音のroot MIDIとcentsを明示しており、周波数を自動推定する機能ではありません。

## APIの要点

- `encodePs1AdpcmCycle()` は112点のPCMを4パケット・64バイトへ符号化する準備用APIです。SPU自体がPCMを自動変換するわけではありません。
- 1周期112点なので、hardware PITCH 4096での基準周波数は `44100 / 112` Hz。`loadADPCM()` にこの値と `loopStartSamples: 0` を明示します。
- ADSRのRateはチップのインデックスです。Attack / Sustainは0〜127、Decayは0〜15、Releaseは0〜31。0が速く、大きな値は段階を止める場合があります。msではありません。
- Sustain levelは0〜15。live編集は実装が現在の段階へパラメーターを適用する機能で、key-onによる再スタートとは別です。
- Voice volume 0.28でSPUの内部ミックスに余裕を作り、後段でgain 0.6を1回だけ掛けます。正規化はしません。
- SPUのnative出力は44,100 Hz。Webだけデバイスの出力レートへ変換します。

実験的なMAME由来SPU実装を使用します。ライセンス・元ソース・再ビルド手順は
npm内の `licenses/mame-ps1-spu/` と `sources/PS1-SPU.md` に同梱されています。

[共有リバーブの例](../02-reverb/README.md) / [repository README](../../../../README.md)

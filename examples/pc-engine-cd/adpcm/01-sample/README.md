# PC Engine CD：MSM5205のサンプルRAM

オリジナルの短いPCMを4-bit OKI ADPCMへ変換し、MSM5205の64 KiB RAMで鳴らします。
公開npm `tetorica-fm2612@0.2.32` の `prepareMSM5205Sample` と `createMSM5205PCM` を使います。
ゲームのサンプル・ROM・BIOS・外部録音は使用しません。

このAPIはPC Engine用RAM再生デバイスです。汎用 `createSoundChip('msm5205')` ではありません。
Analyzerの既存MSM5205 JavaScript／VGM再生経路とは別の共通C/WASM rendererです。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行して開きます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。
Playから音声を準備し、編集可能なコードでsample load・範囲指定・Loop・Stop・再演奏を試します。
停止・終了・エラー・ページ移動でendpointと予約を解放します。

Playground RuntimeのPC Engine CD構成では `adpcm.loadSample(...)`／`adpcm.play(...)` を使います。
元PCMは220 Hz、0.6秒、8,000 Hz monoです。`rate:12` で符号化し、両端25 msをfadeします。
音声生成・ADPCM符号化は準備時に行います。AudioWorkletのrender中には実行しません。

## Node

```sh
node examples/pc-engine-cd/adpcm/01-sample/node/main.mjs
node examples/pc-engine-cd/adpcm/01-sample/node/main.mjs ./adpcm-sample.wav
```

[全コード](node/main.mjs)。Node.js 22以降。出力先省略時は
`output/pc-engine-cd-adpcm-01-sample.wav` です。
48,000 Hz stereo PCM16の左右へ、同じmono音声を書き込みます。全124,800フレーム／2.6秒です。
AudioContext・audify・音声デバイス・実時間のsleepは不要です。

```js
const prepared = await prepareMSM5205Sample({sampleRate:8000, channels:[mono]}, {rate:12});
const wasmBinary = await readFile(runtimeAssetUrl('generated/msm5205_wasm.wasm'));
const pcm = await createMSM5205PCM({sampleRate:48000, wasmBinary});
pcm.prepare(prepared.data);
pcm.play({length:prepared.frames, rate:prepared.rate});
pcm.render(left, right);
```

`rate` はHzではなく0〜15のハードウェア値です。既定clock 1,536,000 Hzでは
`clock / (48 * (16 - rate))` となり、rate12は8,000 Hz、rate15は32,000 Hzです。
`offset`／`length` は**ニブル数**で、byte／秒／出力frame数ではありません。high nibbleから読みます。
このサンプルは4,800ニブル／2,400 bytesで、64 KiBの上限内です。

| Output time | Operation |
| --- | --- |
| 0.0–0.6 s | 全4,800ニブルを1回再生 |
| 0.6–0.8 s | EOFの無音 |
| 0.8–1.6 s | offset 1、length 4,798ニブルをLoop |
| 1.6–1.8 s | Stopの無音 |
| 1.8–2.4 s | 全体を再演奏 |
| 2.4–2.6 s | EOFの無音 |

Loopはデコーダーのpredictorを継続します。任意の中間範囲はつなぎ目でclickや音量変化が出ることがあるため、
奇数ニブル開始の例でも両端のfade部分を残しています。生のADPCM範囲が自動的につながるとは限りません。
内部coreはunity、元PCMの振幅は0.20、保存時のgain 0.5を最後に1回だけ適用します。
正規化は行いません。Nodeはフレーム単位で進むため、実時間で動くWebとのビット一致は保証しません。

`npm run check:node` は実際の220 Hz成分、2周目の音量、再演奏の一致、左右の同一性と
EOF／Stopの厳密な無音を確認します。

BSD-3-Clause license・upstreamの著作者名・全C sourceはnpm packageの
`licenses/tetorica-msm5205/`／`sources/native/msm5205/`／`sources/MSM5205.md` に含まれます。

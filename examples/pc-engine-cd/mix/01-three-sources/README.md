# PC Engine CD：PSG＋ADPCM＋CD-DA

実HuC6280、MSM5205、CD-DAの3系統を混合します。音はすべてこの例で生成したオリジナルです。
公開npm `tetorica-fm2612@0.2.32` だけを使い、本体repository・disc・BIOS・外部音楽データには依存しません。

CD-DA／MSM5205は独立したPCMデバイスです。これらに汎用 `createSoundChip` 名を追加する例ではありません。
PC Engine CD-ROM²の音声経路を扱い、CPU・SCSI・DMA・CDコントローラーは実行しません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行して開きます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。Playから準備・再生します。
Playground Runtimeの `pcEngineCd:true` 構成で `pce`／`adpcm`／`cdda` と独立Mixerを使います。
Main／Workerの選択を試せます。Stop・再Run・エラー・ページ移動で予約と各endpointを回収します。

Webの進行は、CD-DAのみ1秒 → PSGのみ1秒 → ADPCMのみ1秒 → 3系統2秒 → Stop＋無音0.8秒です。
合奏中のPSGはA4／C5／E5／A5を各0.5秒ずつ鳴らします。
既定Worker lookaheadを保ったまま実音声を比較できるよう、Nodeより長い区間を設けています。

## Node

```sh
node examples/pc-engine-cd/mix/01-three-sources/node/main.mjs
node examples/pc-engine-cd/mix/01-three-sources/node/main.mjs ./three-sources.wav
```

[全コード](node/main.mjs)。Node.js 22以降。省略時の出力先は
`output/pc-engine-cd-mix-01-three-sources.wav` です。
48,000 Hz stereo PCM16、全144,000フレーム／3秒。AudioContext・audify・音声デバイス・sleepは使いません。

`Huc6280AudioEngine` を48 kHz・unityで生成し、明示的なDirectTransportを `Huc6280Synth` へ接続します。
MSM5205は同期 `render(left,right)` を `processFrames(count)` へ包み、両方を
`createCddaOffline({sources})` に渡します。すべて同じ出力フレーム数だけ進みます。
`offline.schedule(frame, callback)` によってPSG／ADPCMを同じ時計で操作します。

| Output time | Audible source |
| --- | --- |
| 0.0–0.6 s | CD-DAのみ：左220 Hz／右330 Hz |
| 0.6–1.2 s | PSGのみ：A4／約440 Hz |
| 1.2–1.8 s | ADPCMのみ：880 Hz |
| 1.8–2.8 s | 3系統の合奏。PSGはA4を保持 |
| 2.8–3.0 s | 全系統Stop、厳密な無音 |

CD-DAは0.6〜1.8秒にmuteしますが、source位置は進み続けます。
ADPCMは0.5秒の880 Hz mono、両端25 msをfadeしてrate12／8 kHzへ符号化し、Loopします。
PSGは32sampleのsine近似波、CH0、Volume 26、左右15です。

| Source | Source amplitude / internal gain | Explicit mix |
| --- | --- | --- |
| CD-DA | L/R 0.08 / unity | volume 1、pan 0 |
| HuC6280 | channel volume 26 / engine unity | volume 0.44、pan +0.2 |
| MSM5205 | 0.16 / core unity | volume 0.7、pan −0.3 |

最後にWAV保存時のgain 0.5を1回だけ適用します。上表はこの例の明示的な音作りの値で、
デバイスの内部gainへ重ね掛けしたり、WAVを正規化したりしません。
PSGの0.44は現在のPlaygroundの設定に合わせた値です。ADPCM／CD-DAの新しい音量校正を行うものではありません。
Webは実AudioContext・非同期RPC・Worker予約、Nodeは正確なframe進行を使うので、波形のビット一致は保証しません。

`npm run check:node` は3つの単独区間にそれぞれの周波数が存在すること、他のsourceが混ざらないこと、
合奏に3つの成分とpanが残ること、Stop後の無音を確認します。

各コアの出典・BSD-3-Clause license・全sourceはnpm packageの `licenses/mame-huc6280/`、
`licenses/tetorica-msm5205/`、`sources/native/cdda/` などに同梱されています。

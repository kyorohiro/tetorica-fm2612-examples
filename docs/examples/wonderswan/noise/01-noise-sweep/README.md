# WonderSwan：NoiseとSweep

物理CH3の4種類のNoiseと、CH2の上昇・下降Sweepを順に比較します。
自作の波形・PCMだけを使用し、ゲームROM・BIOS・音楽データは使用しません。
`tetorica-fm2612@0.2.30` の共通factory、WonderSwanSynth、Transportを使います。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。Playのユーザー操作から音声を開始します。

```js
const chip = await createSoundChip('wonderswan', {execution: 'worklet', audioContext, signal});
const transport = new WonderSwanWorkletTransport(chip);
const ws = new WonderSwanSynth({transport, clock: chip.clock});
ws.initialize();
await transport.start();
```

SynthはMain、実コアと音声生成はAudioWorkletで動きます。コード欄は編集して再実行できます。
各Playで新しいチップを生成し、終了・Stop・ページ移動で予約と音声リソースを解放します。読み込み中もStopできます。
WASM・Worklet・ライセンスはインストール済みnpm packageから静的サイトへコピーされます。

## Node

```sh
node examples/wonderswan/noise/01-noise-sweep/node/main.mjs
node examples/wonderswan/noise/01-noise-sweep/node/main.mjs ./wonderswan.wav
```

[全コード](node/main.mjs)。Node.js 22以降。
`createSoundChip('wonderswan', {sampleRate:44100})` → `WonderSwanDirectTransport` → `WonderSwanSynth` と接続し、
`generateStereo()` で時間を進めます。AudioContext・audify・音声デバイス・実時間のsleepは不要です。
出力先省略時は `output/wonderswan-noise-01-noise-sweep.wav` です。

Node版はrawコアのPCMを44,100 Hz stereo PCM16 WAVに保存し、共通の出力gain 0.25だけを掛けます。
チップ固有のunipolar DAC/DC成分を残し、正規化や音量校正は行いません。
Webの音声エンジンはPlaygroundと同じtick単位の波形／Voice中心値補正を使うため、raw Node WAVとビット一致するものではありません。
この違いはチップの音程・命令の意味とは別の出力処理です。

## APIの要点

Noiseは物理CH3の専用機能です。`type` は0〜7、`reset:true` はLFSRをリセットします。
Sweepは物理CH2の11-bit周波数レジスターを時間ごとに増減します。`step` は-128〜127、`time` は0〜31です。

物理CHは0〜3。VoiceはCH1、SweepはCH2、NoiseはCH3を使用します。
チップの入力クロックは3,072,000 Hz、音声出力のサンプルレートとは別です。
内蔵スピーカー・HyperVoice・音声DMA・CPUエミュレーションはこの例の対象外です。

[repository README](../../../../README.md) / [package API](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

コアの出典・BSD-3-Clauseライセンス・改変内容はnpm packageの `licenses/mame-wonderswan/` と `sources/third_party/mame-wonderswan/` に含まれます。

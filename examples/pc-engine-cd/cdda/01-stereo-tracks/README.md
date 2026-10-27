# PC Engine CD：CD-DAのステレオトラック

この例専用のオリジナル音を生成し、CD-DAのトラック選択・Pause／Resume・Seek・再演奏を試します。
公開npm `tetorica-fm2612@0.2.32` の `createCddaPlayer`／`createCddaOffline` と共通C/WASM rendererを使用します。
ゲームの音楽・disc image・BIOS・外部録音は含みません。

CD-DAはPCM音声デバイスです。`createSoundChip('cdda')` では生成しません。
入力は44,100 Hz・stereo・PCM16 RIFF WAV、出力は実行環境の音声サンプルレートへ補間されます。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行して開きます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。Playの操作から音声を準備します。
コード欄は編集して再実行できます。Stop・終了・エラー・ページ移動で音声と予約を解放します。
WASM／Worklet／ライセンスはインストール済みnpm packageからコピーされます。

2トラックのmanifestを `cdda.load(...)` へ渡します。`/generated/stereo.wav` は、この例が生成した
WAVを返す読み込みハンドラーで解決する名前であり、ゲームdiscのファイルではありません。
CD-DAとそのトラック管理を使う例で、実際のCDドライブやCUE/BINを読み込むものではありません。

## Node

```sh
node examples/pc-engine-cd/cdda/01-stereo-tracks/node/main.mjs
node examples/pc-engine-cd/cdda/01-stereo-tracks/node/main.mjs ./stereo-tracks.wav
```

[全コード](node/main.mjs)。Node.js 22以降。出力先省略時は
`output/pc-engine-cd-cdda-01-stereo-tracks.wav` へ48,000 Hz stereo PCM16 WAVを保存します。
AudioContext・audify・音声デバイス・実時間のsleepは使いません。

生成元WAVは2.4秒、各1.2秒の2トラックです。両端20 msをfadeし、左右で異なる周波数を使います。

| Track | Source range / 44,100 Hz frames | Left | Right |
| --- | --- | --- | --- |
| 2 | `[0, 52920)` | 220 Hz | 330 Hz |
| 3 | `[52920, 105840)` | 440 Hz | 660 Hz |

manifestの `startFrame`／`endFrame` は半開区間で、出力フレームではありません。
音声の振幅は0.16、renderer／stripはunity。WAV保存時のgain 0.5を最後に1回だけ掛けます。
自動正規化や非公開のMixer校正は行いません。

| Output time | Operation |
| --- | --- |
| 0.0–0.6 s | Track 2 |
| 0.6–0.8 s | Pause：無音、source位置を保持 |
| 0.8–1.2 s | Resume |
| 1.2–1.6 s | Track 2の0.2秒へSeek |
| 1.6–2.8 s | Track 3を最初から最後まで再生 |
| 2.8–3.0 s | EOFの無音 |
| 3.0–3.4 s | Track 2の0.25秒から再演奏 |
| 3.4–3.6 s | Stopの無音 |

全172,800出力フレームです。Nodeは `offline.render(count)` で正確に時間を進めます。
Webは実AudioContextと非同期操作を使うため、操作タイミングやWAVとのビット一致は保証しません。
CD-DAの時計は音声側で進み、UIがPCMの各blockを補給する構成ではありません。

`npm run check:node` は左右の周波数、Pause／EOF／Stopの無音、Seek／再演奏位置の同一PCMを確認します。

共通C source・BSD-3-Clause license・rebuild recipeはnpm packageの `sources/native/cdda/` と
`sources/scripts/build_cdda_wasm.sh` に含まれます。

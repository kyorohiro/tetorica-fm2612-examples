# SID：1つの共有フィルター

公開済み `tetorica-fm2612@0.2.39` の専用SID APIで、3つのSawボイスを
1つのハードウェアフィルターへ送ります。LP / BP / HPの出力選択と、
共通のCutoff・Resonanceを6581／8580 Previewで試します。
音列はコード内のオリジナルで、C64 CPU・ROM・SID曲は使いません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行します。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

Modelを選んでPlayを押すと、6秒の和音を鳴らします。
演奏中にLP / BP / HP・Cutoff・Resonanceを変更できます。
コードの編集は次のPlayに反映され、`applyFilter()` は現在のUI値を読み取って
`sid.setFilter()` へ送る、この例だけの関数です。
すべての出力をOffにすると、このUIは `routing: 0` でdry音を鳴らします。

`createSidAudio()` → `createSidClient()` で専用のAudioWorkletへ接続し、
`sid.initialize()` してから操作します。音声はWASMで生成し、UIのタイマーは
音符の長さだけを扱います。モデルの変更はStop後に行います。
読み込み中もStopでき、終了・失敗・ページ移動時に音源とAudioContextを解放します。
汎用のチップfactoryやPlaygroundのWorkerは使いません。

## Node

```sh
node examples/c64/sid/02-filter/node/main.mjs
node examples/c64/sid/02-filter/node/main.mjs ./filter-6581.wav --model=6581
node examples/c64/sid/02-filter/node/main.mjs ./filter-8580.wav --model=8580
```

[全コード](node/main.mjs)。Node.js 22以降で実行します。
`SidCore` / `Sid8580Core` を `wasmBinary` から作り、`SidSynth` で設定します。
PCMを生成してWAVへ書き出すので、AudioContext・audify・音声デバイスは不要です。

同じ和音を鳴らし続けたまま、各0.6秒で次の8設定へ切り替えます。
標準値はCutoff code 700・Resonance 5です。

1. Dry（routing 0）
2. Low-pass
3. Band-pass
4. High-pass
5. Notch（LP + HP）
6. LP + BP + HP
7. Low-pass、Cutoff code 1400
8. Low-pass、Cutoff code 700・Resonance 10

最後に0.6秒のReleaseを収録し、各モデルは5.4秒です。
既定の `--model=both` は6581→8580の順で合計10.8秒。
出力先の既定値は `output/c64-sid-02-filter.wav` です。
48,000 Hz・stereo PCM16（monoの複製）へ、Webと同じgain 0.35を1回だけ掛けます。

## フィルターの要点

- フィルターは全ボイスで共有します。ボイスごとに独立したCutoff・Resonanceを持ちません。
- `routing` は3ボイスのビットマスク。7なら3つすべてを送ります。
- LP・BP・HPは選んだ出力を加算します。LP + HPの名前は `notch` です。
- `cutoff` は11-bitの0〜2047、`resonance` は0〜15のチップコードです。CutoffはHzではなく、モデルによって周波数特性も異なります。
- ハードウェアは `mode: 'off', routing: 7` なら、送られたボイスを無音にします。UIの「すべてOffでdry」は明示的なアプリ側の設定です。
- 6581は近似、8580はPreviewです。同じコードでも同じHz・同じ音量になるとは限りません。研究用calibrationは既定のOffを維持します。
- 出力の12 Hz DC blockerはホスト側の処理で、この共有フィルターとは別です。モデルごとの音量正規化や追加のWeb Audioフィルターは使いません。

このフォルダーは他のサンプルや共通音声ヘルパーへ依存しません。
ライセンス・対応ソース・再ビルド手順はnpm内の `sources/SID.md` と `sources/SID8580.md` にあります。

[repository README](../../../../README.md) / [3ボイスとADSRの例](../01-voices/README.md)

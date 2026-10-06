# YM2608 ADPCM-B：PCM / WAV の loadSample

`tetorica-fm2612@0.2.3` の `YM2608Synth.adpcm.loadSample()` を使う例です。
自作の PCM と、そこから作る WAV を入力にするため、外部ファイルは不要です。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧から
[実行ページ](web/index.html)を開いて Play を押します。
[Web の全コード](web/main.js)に WASM 読み込み・PCM 作成・loadSample・音源操作・
44.1 kHz への変換・Web Audio 再生・停止・WAV 保存・リソース解放を記述しています。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/pc98/adpcm-b/02-load-sample/node/main.mjs
```

[Node の全コード](node/main.mjs)が `output/pc98-adpcm-b-02-load-sample.wav` を保存します。
末尾に出力パスを渡せます。音は保存した WAV をプレイヤーで聴いてください。

## 試していること

1. 440 Hz の Float32 PCM をコード内で生成。
2. `loadSample({channels: [wave], sampleRate: 8000}, {address: 0})` で mono 化・ADPCM-B 変換・転送・再生範囲と速度の設定。
3. 音量・左右出力を指定し、`keyOn()` で通常速度の再生。
4. npm package の `encodeWav()` で入力 WAV を生成し、`loadSample(sourceWav, {address: 4096})` で別領域へ読み込み。
5. `setPlaybackRate()` で1.5倍速にして再生。

`loadSample()` は読み込み時に ADPCM-B を停止しますが、再生は開始しません。
音量・パンは変更しません。戻り値の `duration` は32-byte単位のパディングを含む実再生時間、
`sampleRate` は Delta-N に量子化された実レートです。
アドレスは32-byte境界とし、他のサンプルと重ならない領域を利用者が確保します。
`loadMemory()` は既にエンコード済みの ADPCM-B バイト列を転送する API です。

Web / Node のコードは共通ヘルパーを使わず、それぞれのファイルに全部書いています。
PCM は事前生成し、YM2608 のネイティブ出力を線形補間で 44.1 kHz に変換します。

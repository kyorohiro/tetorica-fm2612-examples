# YM2608 ADPCM-B：サンプルメモリ再生

エンコード済み ADPCM-B を loadMemory で転送し、再生範囲・速度・音量・ループを設定する。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 自動読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/pc98/adpcm-b/01-sample/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 自動読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/pc98-adpcm-b-01-sample.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

YM2608 のネイティブ PCM は高いサンプルレートなので、各コード内で線形補間により 44.1 kHz に変換します。この音源操作の最小例であり、汎用の帯域制限付きリサンプラーではありません。

`loadMemory()` はエンコード済み ADPCM-B の byte 配列を転送するだけです。WAV / PCM の読み込み・エンコードはしません。`setSample()` で再生範囲を指定し、`keyOn()` で開始します。この例の byte 配列は自作パターンで、外部サンプルは不要です。

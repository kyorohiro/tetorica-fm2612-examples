# PC-98 YM2608 の SSG トーン

YM2608 内蔵 SSG の矩形波を 440 Hz で鳴らす。音量を指定して停止する。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 自動読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/pc98/ssg/01-tone/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 自動読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/pc98-ssg-01-tone.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

YM2608 のネイティブ PCM は高いサンプルレートなので、各コード内で線形補間により 44.1 kHz に変換します。これらの単音用の最小例であり、汎用の帯域制限付きリサンプラーではありません。

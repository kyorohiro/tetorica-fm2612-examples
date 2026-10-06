# Game Boy pulse のデューティ比

pulse チャンネルで 12.5%・25%・50%・75% の矩形波を比較する。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/gameboy/pulse/01-duty/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/gameboy-pulse-01-duty.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

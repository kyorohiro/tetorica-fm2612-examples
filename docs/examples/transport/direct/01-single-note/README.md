# DirectTransport：PCM を生成して再生・WAV 保存

DirectTransport で手元のチップへ命令を書き、`generateStereo(frames)` で PCM を生成します。
Web は AudioBufferSourceNode で生成済み PCM を再生し、Node は encodeWav でファイル保存します。
この例は PCM 生成・連結・WAV 保存の説明用なので、その手順をすべて記述しています。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 自動読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/transport/direct/01-single-note/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 自動読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/transport-direct-01-single-note.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

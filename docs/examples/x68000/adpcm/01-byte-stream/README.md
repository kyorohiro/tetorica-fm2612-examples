# X68000 OKIM6258 の ADPCM 再生

自作の 4-bit ADPCM バイト列を時間に合わせて送り、波形を再生する。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/x68000/adpcm/01-byte-stream/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/x68000-adpcm-01-byte-stream.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

この例は X68000 の音源単体を扱います。CPU・DMA・メモリマップのエミュレーションではありません。

音源クロックと OKIM6258 の 4-bit / 10-bit 出力・divider 512 設定は [MAME の X68000 machine configuration](https://github.com/mamedev/mame/blob/master/src/mame/sharp/x68k.cpp) を参考にしています。

自作 ADPCM パターンをコード内で生成するため、外部音声ファイルや ROM は不要です。制御・データ・パンの番号は package の VGM 用 engine API です。実機の I/O アドレスとは異なります。

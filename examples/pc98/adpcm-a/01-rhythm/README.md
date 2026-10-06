# YM2608 ADPCM-A：固定リズム音源

package 同梱の Tetorica 自作リズム ROM を読み込み、bass drum・snare・hi-hat を鳴らす。

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧からこの例を開いて Play を押します。

- [実行ページ](web/index.html)
- [Web の全コード](web/main.js): npm import → WASM 読み込み → 音源操作 → PCM 生成 → Web Audio 再生・停止 → WAV 保存 → リソース解放。

## Node.js

Node.js 22 以降で repository ルートから実行します。

```sh
node examples/pc98/adpcm-a/01-rhythm/node/main.mjs
```

[Node の全コード](node/main.mjs) に npm import、WASM 読み込み、音源操作、PCM 生成、WAV エンコード、ファイル保存、dispose を記述しています。
`output/pc98-adpcm-a-01-rhythm.wav` に保存します。コマンド末尾に出力パスを渡せます。
音を聴くには WAV を音声プレイヤーで開いてください。

Web / Node のコードは、それぞれのファイルだけで処理を追えるように重複を含めています。
`generateStereo(frames)` で時間を進め、Web では生成済み PCM を再生します。

YM2608 のネイティブ PCM は高いサンプルレートなので、各コード内で線形補間により 44.1 kHz に変換します。この音源操作の最小例であり、汎用の帯域制限付きリサンプラーではありません。

YM2608 の ADPCM-A は固定の6リズムです。`rhythm.loadRom()` は固定配置の 8192-byte ROM を受け取り、`setVoice()` と `keyOn()` で声を選択します。任意サンプルのアドレスを指定する YM2610 ADPCM-A の例ではありません。使用 ROM は package 同梱の Tetorica 自作データで、元の Yamaha ROM とは音が異なります。ライセンスは package 内 `assets/opna-rhythm/LICENSE`。

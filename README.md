# tetorica-fm2612 examples

公開済み `tetorica-fm2612@0.2.0` を import して使う、機能別の小さなサンプル集。
各サンプルに Web と Node.js の入口を置いています。本体リポジトリには依存しません。

パッケージ本体の説明・API の使い方・配布設定は
[hello_ymfm_wasm/packages/fm2612](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612)
を参照してください。

## 起動

Node.js 22 以降で repository ルートから実行します。

```sh
npm install
npm run dev
```

http://127.0.0.1:5173 の一覧から Web 版を開いて Play を押します。
`PORT=8080 npm run dev` でポートを変更できます。

## サンプル一覧

| 分類 | サンプル | 学ぶこと |
| --- | --- | --- |
| FM | [01-single-note](examples/fm/01-single-note/README.md) | preset / noteOn / noteOff |
| FM | [02-melody](examples/fm/02-melody/README.md) | 音程と音符の長さ |
| FM | [03-presets](examples/fm/03-presets/README.md) | sine / bell / organ の比較 |
| FM | [04-operators](examples/fm/04-operators/README.md) | algorithm / operator |
| FM | [05-stereo-pan](examples/fm/05-stereo-pan/README.md) | 左・右・両側の出力 |
| FM | [06-chord](examples/fm/06-chord/README.md) | 複数チャンネルで和音 |
| Chip raw | [01-register-note](examples/chip-raw/01-register-note/README.md) | YM2612 レジスタ直接操作 |
| PSG | [01-tone](examples/psg/01-tone/README.md) | Sega PSG のトーン |
| PSG | [02-noise](examples/psg/02-noise/README.md) | 周期 / ホワイトノイズ |
| PCM | [01-wav-export](examples/pcm/01-wav-export/README.md) | Float32 PCM と WAV 出力 |

## 各フォルダーの構成

```text
examples/fm/01-single-note/
├── README.md
├── web/
│   ├── index.html
│   └── main.js       npm import → WASM → 音源操作 → PCM → 再生・停止・WAV 保存
└── node/
    └── main.mjs      npm import → WASM → 音源操作 → PCM → WAV 保存
```

各ファイルに必要なコードをすべて記述します。サンプル間や Web / Node 間の
重複はそのまま残し、共通の音源処理・再生ヘルパーは使いません。
パッケージと実行環境の標準 API だけを使用します。

`generateStereo(frames)` で PCM を生成してチップの時間を進めます。
Web 版は生成済み PCM を Web Audio で再生します。
各ファイル内に PCM の連結、WAV ヘッダーとデータの書き込み、リソース解放も載せています。

## Node 版

```sh
node examples/fm/01-single-note/node/main.mjs
node examples/fm/02-melody/node/main.mjs ./melody.wav
```

既定では `output/<サンプル名>.wav` に保存します。
Node 版に AudioContext や音声ドライバーは不要です。
WAV をスピーカーで聴く場合は音声プレイヤーで開いてください。
Web と Node の音源操作は同等ですが、各ファイルにそれぞれ記述しています。

## ビルド

```sh
npm ci
npm run build
```

静的サイトを `dist/` に生成します。すべての Web ページ、音源コード、
Node ソース、説明を同梱します。相対 URL を使うので
GitHub Pages の repository 配下にも配置できます。公開は別途行ってください。

npm package の全内容も `vendor/tetorica-fm2612/` にコピーします。
import map で bare import を解決し、JS / WASM / Worker / Worklet の配置と
ライセンス・同梱ソースを保ちます。バンドラーや CDN は使用しません。
`public/vendor/`、`dist/`、`output/` は生成物で、git 管理しません。

`0.2.0` のブラウザ用 factory の既定 `locateFile` と生成済みローダーには
互換性の問題があるため、各例のコードで公開 API の
`moduleOptions.wasmBinary` に WASM を渡しています。

## サンプルを追加する

機能の分類内にフォルダーを作り、`web/`、`node/`、README を置きます。
一覧の原本は `examples/manifest.json` です。そこにタイトルと説明を追加すると
Web の一覧にも表示されます。ビルドで examples フォルダー全体を配布します。

## License

サンプルコードは BSD-3-Clause。ランタイムの第三者ライセンスは
配布パッケージ内の `THIRD_PARTY_LICENSES.txt`、`licenses/`、`sources/` を参照してください。

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
| FM | [01-single-note](examples/genesis/fm/01-single-note/README.md) | preset / noteOn / noteOff |
| FM | [02-melody](examples/genesis/fm/02-melody/README.md) | 音程と音符の長さ |
| FM | [03-presets](examples/genesis/fm/03-presets/README.md) | sine / bell / organ の比較 |
| FM | [04-operators](examples/genesis/fm/04-operators/README.md) | algorithm / operator |
| FM | [05-stereo-pan](examples/genesis/fm/05-stereo-pan/README.md) | 左・右・両側の出力 |
| FM | [06-chord](examples/genesis/fm/06-chord/README.md) | 複数チャンネルで和音 |
| Chip raw | [01-register-note](examples/chip-raw/01-register-note/README.md) | YM2612 レジスタ直接操作 |
| PSG | [01-tone](examples/genesis/psg/01-tone/README.md) | Sega PSG のトーン |
| PSG | [02-noise](examples/genesis/psg/02-noise/README.md) | 周期 / ホワイトノイズ |
| PCM | [01-wav-export](examples/genesis/pcm/01-wav-export/README.md) | Float32 PCM と WAV 出力 |
| AudioWorklet | [01-note](examples/audio-worklet/01-note/README.md) | 音声スレッドで FM 発音、初期化・停止・解放 |
| PC-98 | [01-note](examples/pc98/fm/01-note/README.md) | PC-98 YM2608 の FM 発音 |
| PC-98 | [01-tone](examples/pc98/ssg/01-tone/README.md) | PC-98 YM2608 の SSG トーン |
| Game Boy | [01-duty](examples/gameboy/pulse/01-duty/README.md) | Game Boy pulse のデューティ比 |
| Game Boy | [01-waveform](examples/gameboy/wave/01-waveform/README.md) | Game Boy wave の波形メモリー |
| Game Boy | [01-width](examples/gameboy/noise/01-width/README.md) | Game Boy noise の幅 |

## 各フォルダーの構成

```text
examples/genesis/fm/01-single-note/
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
FM / PSG / PCM の Web 版は生成済み PCM を Web Audio で再生します。
AudioWorklet の例は processor が音声スレッドで PCM を生成します。
Node 版は DirectTransport による同じ音源設定のオフライン生成です。
オフライン生成の例には PCM の連結と WAV エンコードも載せています。
AudioWorklet の Web 版には ready 待機と transport・node・AudioContext の解放を載せています。

## Node 版

```sh
node examples/genesis/fm/01-single-note/node/main.mjs
node examples/genesis/fm/02-melody/node/main.mjs ./melody.wav
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

# TFI：音色の import / export

TFI バイナリを preset に変換して発音し、音色ファイルと WAV を保存する。

公開済み `tetorica-fm2612@0.2.10` を import します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

外部ファイルなしで試せます。Web は手元の `.tfi` も選択できます。Node は `node examples/patches/01-tfi-roundtrip/node/main.mjs input.tfi output.wav` で入力・出力を指定できます。出力 WAV の横に `.tfi` を保存します。TFI / VGI の論理 operator 番号は 1〜4 です。

## Node

```sh
node examples/patches/01-tfi-roundtrip/node/main.mjs
```

[全コード](node/main.mjs)。AudioContext は使わず、`output/` に出力します。

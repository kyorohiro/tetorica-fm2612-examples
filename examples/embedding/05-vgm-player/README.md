# VGM Runtime：ファイルを再生

自作の PSG VGM または手元の VGM を読み込み、再生・停止・解放する。

公開済み `tetorica-fm2612@0.2.3` を import します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

Web は `VgmRuntime`、Node は同じ GenesisAudioEngine と `VgmPlayer` を使います。YM2612 + Sega PSG 向けの例です。任意のチップや VGZ の対応例ではありません。Node は最大60秒で出力を打ち切ります。`pause()` / `resume()` / `setLoopEnabled()` も Runtime の公開 API です。

## Node

```sh
node examples/embedding/05-vgm-player/node/main.mjs
```

[全コード](node/main.mjs)。AudioContext は使わず、`output/` に出力します。

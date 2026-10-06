# Playground Runtime：Worker で実行

Playground のコードを load() し、Worker で実行してアプリに組み込む。

公開済み `tetorica-fm2612@0.2.5` を import します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

`liveLoop` は停止まで繰り返します。この例は約2.3秒後に停止します。`stop()` は演奏を止め、`finalize()` は Worker と音声リソースを解放します。エディターのコードは実行されるので、自分で信頼するコードを入力してください。

## 実行環境

この埋め込み例はブラウザの AudioContext / AudioWorklet / Worker を使います。
Node にこのブラウザ API をそのまま持ち込む例ではありません。
オフライン PCM / WAV の生成は Genesis FM の Node 例を参照してください。

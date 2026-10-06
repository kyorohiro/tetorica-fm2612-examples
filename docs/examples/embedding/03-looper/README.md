# MegaSynthLooper：音符をループ

演奏した noteOn / noteOff を1周分記録し、繰り返し再生・undo・停止する。

公開済み `tetorica-fm2612@0.2.5` を import します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

イベント looper の例です。音符は `mega.fm` へ直接ではなく `looper.noteOn()` / `noteOff()` へ送ります。最初の録音の長さがループ長になります。

## 実行環境

この埋め込み例はブラウザの AudioContext / AudioWorklet / Worker を使います。
Node にこのブラウザ API をそのまま持ち込む例ではありません。
オフライン PCM / WAV の生成は Genesis FM の Node 例を参照してください。

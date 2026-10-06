# MegaSynth：イベント録音と再生

noteOn / noteOff を JSON に記録し、export → import → playRecording で再演奏する。

公開済み `tetorica-fm2612@0.2.3` を import します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

これは PCM / マイク録音ではなく、音源操作と時刻を記録するイベント録音です。音色を設定してから録音を開始し、初期音色も JSON に保持します。

## 実行環境

この埋め込み例はブラウザの AudioContext / AudioWorklet / Worker を使います。
Node にこのブラウザ API をそのまま持ち込む例ではありません。
オフライン PCM / WAV の生成は Genesis FM の Node 例を参照してください。

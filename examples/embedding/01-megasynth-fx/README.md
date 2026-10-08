# MegaSynth：発音と FX

MegaSynth の start() → FM 発音 → delay / reverb → close() をアプリに組み込む。
Web / Node とも同じ sine preset と3音を使い、音源の後ろに FX を繋ぎます。
公開済み `tetorica-fm2612@0.2.10` を import します。

## Web

[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
Play はユーザー操作から開始します。Stop・完了・エラー時にリソースを解放します。

AudioContext / AudioWorklet を使い、Worklet と WASM の配置には package の `runtimeAssetUrl()` を使います。
FX は Web Audio の delay / reverb です。
`mega.mixer.set(mega.fm.id, {volume: 0.8})` で FM だけの出力音量も設定します。これは全体の `masterVolume` と別に調整できます。

## Node

[全コード](node/main.mjs) を参照してください。Node.js 22 以降で実行します。

```sh
npm ci
npm install --no-save --package-lock=false audify
node examples/embedding/01-megasynth-fx/node/main.mjs
```

`MegaSynthNode` を `tetorica-fm2612/node` から import します。
Worker 内で FM → nativeFX の delay / reverb → audify の音声デバイス出力を実行します。
WAV 出力ではなく、その場でスピーカーから3音を鳴らす例です。
Web / nativeFX は別の DSP 実装なので、FX の響きが完全に同じになる例ではありません。

FM 命令は非同期なので await し、FX の設定後は `flush()` で完了を待ちます。
正常終了とエラー時に `close()` で音声デバイスと Worker を解放します。
macOS / CoreAudio で検証済みです。Windows / Linux のリアルタイム出力は未検証です。

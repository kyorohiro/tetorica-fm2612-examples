# AudioWorklet で FM 発音

## Web

repository ルートで `npm install`、`npm run dev` を実行し、一覧から
[実行ページ](web/index.html)を開いて Play を押します。
AudioWorklet は HTTPS または localhost で使用してください。

[Web の全コード](web/main.js)に以下を記述しています。

1. click から AudioContext を作成・resume。
2. npm package の `ym2612-worklet.js` を `audioWorklet.addModule()` で読み込み。
3. WASM を fetch し、`initialize` メッセージとともに MessagePort で転送。
4. processor の `ready` 応答を待機。
5. `YM2612WorkletTransport` と `YM2612Synth` で preset / noteOn / noteOff。
6. Stop・読み込み失敗・タイムアウト・終了時に transport、node、AudioContext を解放。

音源の PCM 生成とリサンプリングは AudioWorklet の音声スレッドで行います。
メインスレッドで `generateStereo()` を呼び、生成済み PCM を再生する例との違いです。
ブラウザのタイマーで発音時間を指定する最小例であり、サンプル単位の予約再生ではありません。
Web 版はリアルタイム再生の例なので WAV ダウンロードは行いません。

## Node.js：同じ音源設定でオフライン生成

AudioWorklet はブラウザの API です。Node 版では代わりに
`YM2612DirectTransport` を使い、同じ sine・音程・発音時間で WAV を生成します。

```sh
node examples/audio-worklet/01-note/node/main.mjs
```

[Node の全コード](node/main.mjs)に読み込み・音源操作・PCM 生成・WAV エンコード・
保存・dispose を記述しています。出力は `output/audio-worklet-01-note.wav`。
Web 版は AudioContext の出力レート、Node 版はチップのレートなので、
両者の PCM がバイト単位で一致することを前提にしません。

各ファイルは共通ヘルパーを使用せず、npm package と標準 API だけで実行します。

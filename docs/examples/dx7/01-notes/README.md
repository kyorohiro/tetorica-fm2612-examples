# DX7：メロディーと和音

公開済み **`tetorica-fm2612@0.2.14`** の Playground runtime を使い、DX7 の
初期音色 **INIT SINE** で短いメロディーと C メジャーの和音を演奏します。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。
repository ルートで `npm install` → `npm run dev` を実行し、一覧から開きます。

```javascript
const dx7 = await useSoundChip('dx7');
await mixer.set(dx7.id, {volume: 0.5});
setBpm(120);
dx7.noteOn(60, 100); // MIDI C4、velocity 100。
await beat(1);      // BPM 120 では0.5秒。
dx7.noteOff(60);
```

`useSoundChip`、`mixer`、`setBpm`、`beat` は、`pg.load()` したコードを
`pg.play()` で実行するときの Playground グローバル API です。
ページ側は公開 `Playground()` を生成し、`initialize()`／`load()`／`play()` を
通してコードを実行します。

実行先は **Worker** が既定で、**Main** にも切り替えられます。
ノート番号は MIDI の整数 0〜127、velocity は 0〜127。和音は複数回の
`noteOn()` で鳴らし、`allNotesOff()` でまとめて離鍵します。
音源は最大16ボイス、mono です。内部レートは 44,100 Hz 固定で、
Web Audio 出力は 44,100 Hz／48,000 Hz に対応します。

Play はエディターの内容を一度読み取って実行します。サンプルは有限の演奏で、
最後に音を離鍵し、1拍のリリース時間をコード内で確保して完了します。
ページ側で固定タイマーを使って演奏を打ち切る処理はありません。
音色を変えて長いリリースを使う場合は、コード内の最後の待機も調整してください。
`liveLoop()` を追加した場合は繰り返し演奏になるため、継続再生用のホスト処理へ
変更する必要があります。この例のホストは有限スクリプトの完了後に解放します。

Stop は演奏中だけでなく読み込み中にも受け付けます。読み込み中に停止した場合、
初期化の完了後に中止を確認し、コードを開始せず `finalize()` します。
完了・停止・エラーのいずれでも音声と Worker を解放し、その後に再び Play できます。

この例は HTTPS／localhost の AudioContext／AudioWorklet／Worker を使う
**ブラウザー専用**です。このフォルダーに Node 用の実行例はありません。
WASM と Worklet はインストール済み npm package からローカルの vendor 配下へ
コピーされ、`runtimeAssetUrl()` で解決されます。

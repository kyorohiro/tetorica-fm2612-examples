# SNES：BRR でメロディーと和音（実験的）

公開済み **`tetorica-fm2612@0.2.20`** の実験的な SNES S-DSP を使います。
自作の9バイト BRR をループさせ、単音と3音の和音を演奏します。
ゲームの音色・ROM・SPC ファイルは使用しません。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repository ルートで
`npm install` → `npm run dev` を実行し、一覧から開きます。
Playground の `useSoundChip('snes')` を使い、**Main / Worker** を選択できます。
HTTPS または localhost と、AudioWorklet 対応ブラウザーが必要です。

```javascript
const snes = await useSoundChip('snes');
const sample = await snes.loadBRR(
  new Uint8Array([0xc3, 0x13, 0x57, 0x75, 0x31, 0xfd, 0xb9, 0x9b, 0xdf]),
  {baseFrequencyHz: 2000, loopStartSamples: 0},
);
snes.setPreset(0, {sample, adsr1: 0x8f, adsr2: 0xe0});
snes.noteOn(0, 'C4');
await beat(1);
snes.noteOff(0);
```

`useSoundChip` / `beat` は `pg.load()` したスクリプト内のグローバルです。
ホストは `Playground()` の初期化・実行・解放まで記述しています。
有限の演奏が終わると自動解放し、Stop は初期化中にも受け付けます。
コードの編集は次の Play に反映されます。
Worker は既定の先読み予約を使うため、コード末尾には予約した離鍵とリリースが
出力に届くまでの待機も確保します。この例では最後に2拍待ってから解放します。

## Node

```sh
node examples/snes/01-brr-notes/node/main.mjs
node examples/snes/01-brr-notes/node/main.mjs ./snes-brr-notes.wav
```

[全コード](node/main.mjs)。`SnesDspCore` と `SnesSynth` でオフライン生成し、
`encodeWav()` で32,000 Hz の stereo PCM16 WAV に保存します。
出力先省略時は `output/snes-01-brr-notes.wav`。音声デバイスや audify は不要です。
Node.js 22 以降を使います。`renderInto()` がチップの時間を進めるため、
Web 版の `beat()` に相当する区間をフレーム数に変換して順に生成します。

## 音色と実験的実装の制約

- 物理ボイスは **0〜7 の8個**。自動ボイス割り当てはなく、和音は別ボイスに割り当てます。
- BRR に調律情報はありません。この16サンプル波形は PITCH 4096 で2,000 Hz
  なので、`baseFrequencyHz: 2000` を明示しています。別の BRR を使う場合は、
  実際の調律に合わせた `rootNote` または `baseFrequencyHz` とループ位置を指定します。
- `adsr1` / `adsr2` / `gain` は S-DSP の生レジスタ値です。秒指定ではありません。
  `gain` は ADSR1 の bit7 が0のときに有効です。左右音量も -128〜127 のレジスタ値です。
- 内部は **32,000 Hz 固定**。Web では出力側で変換します。Node はネイティブレートのまま保存します。
- SPC700 CPU やゲームのドライバーは実行せず、独立した DSP とサンプル RAM を使います。
  SPC ファイルの再生は別のプレイヤー API です。
- 実験的 API です。サンプル RAM は64 KiBで共有し、音色の追加には容量制限があります。
  この例は新しいランタイムで1音色を読み込み、演奏後に解放します。
- 急な音程・音量変更では波形に段差が生じる可能性があります。
  自動的なスムージングは追加しません。

S-DSP エンジンは LGPL-2.1-or-later の `snes_spc` に基づきます。
エンジンのライセンス・対応ソースは npm package 内の `licenses/` / `sources/` に同梱されます。

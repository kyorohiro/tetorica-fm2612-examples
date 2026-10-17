# DX7：SysEx と音色選択

`tetorica-fm2612@0.2.20` の Playground Runtime から、DX7 の1音色 / 32音色バンクを読み込みます。
[Web ページ](web/index.html) / [全コード](web/main.js)。`npm run dev` の一覧から開いてください。

1. 必要なら手元の DX7 `.syx` を選択します。未選択なら同梱の自作バンクです。
2. **Load bank** で読み込み、音色一覧を表示します。
3. 音色と Main / Worker を選択し、**Play** でメロディと和音を試聴します。
4. **Stop** は読み込みや演奏を中断し、最後に Runtime を解放します。

```javascript
// Playground の script 内。bankBytes はホストが読んだ Uint8Array。
const dx7 = await useSoundChip('dx7');
await dx7.loadSysex(bankBytes); // 適用完了を待つ。
console.log(dx7.voices);       // [{index, name}, ...]
dx7.selectVoice(0);           // 0始まり。単音色なら0、バンクなら0..31。
dx7.noteOn(60, 100);          // MIDI C4、velocity 100。channel 引数なし。
await beat(1);
dx7.noteOff(60);
```

完全な Yamaha DX7 bulk dump に対応します。163バイトの1音色または4104バイトの32音色バンクです。
不正なファイルでは前に読み込めたバンクを残し、引き続き Play できます。新しいバンクの読込み時は音色0を選択します。
ファイルはホストで読み、数値配列リテラルとして script に渡します。`pg.context` は Main / Worker 間で共有されないため使用しません。
音色名は script の `console.log()` → 公開 `onLog` コールバックで受け取ります。
ガードされた script 内での fetch や外部通信は不要です。

音声生成は Main / Worker のどちらも AudioWorklet 内です。最大16ボイス、mono、内部44,100 Hz。
AudioContext の44,100 / 48,000 Hz に対応し、48,000 Hz 出力時は内部で変換します。
msfa の AM・transpose などの制約は同梱 `vendor/tetorica-fm2612/msfa_dx7/README.md` を参照してください。

## 同梱音色

[original-bank.syx](assets/original-bank.syx) は本サンプル用に自作した32音色です。第三者の音色集や工場出荷音色は含みません。
Algorithm 32 の単一キャリア `SINE 01..16` と、並列キャリアで倍音を加えた `HARM 01..16` です。
各音色はキャリアの coarse / fine が異なるため、同じ MIDI ノートでも高さ・倍音構成が変わります。
サンプルと同じ BSD-3-Clause で提供します。[生成コード](assets/create-bank.mjs) も同梱しています。

```sh
node examples/dx7/02-sysex/assets/create-bank.mjs
```

## 実行環境

ブラウザ専用です。HTTPS または localhost を使用します。`Playground` の `useSoundChip('dx7')` は
package root の `createSoundChip()` と別の入口です。Node で直接 PCM を作る場合は別 package
`tetorica-msfa-dx7-wasm` の `createDX7()` を使用してください。この例に追加依存や Node 版はありません。

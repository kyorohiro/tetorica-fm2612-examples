# SPU：標準VABからProgram / Toneを使う

公開済み **`tetorica-fm2612@0.2.40`** の `readVab()`・`prepareVabTone()`・
`exportVab()` を使います。標準VABのまま読み込み、JSON presetを経由せずSPUで鳴らせます。
同梱の [demo.vab](assets/demo.vab) は自作の合成データです。ゲーム音源・ROM・外部録音は含みません。
Program 3にTone 0 / 1、Program 11にTone 0があり、ループ音と短い一発音を試せます。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで
`npm install` → `npm run dev` を実行します。HTTPSまたはlocalhost、AudioWorklet対応ブラウザーが必要です。

1. **Load demo** で同梱bank、または **Open VAB…** で自分のcombined `.vab` を開きます。
2. Program / Toneと音名（初期値C4）を選び、**Play selected note** を押します。
3. 0.6秒の発音と0.15秒のRelease後に停止します。途中で **Stop** も押せます。
4. **Export selected VAB** で、選択した元Toneを標準 `.vab` として保存します。

ファイルや選択を変えただけでは発音しません。コード欄の変更は次のPlayに反映されます。
不正ファイルやキャンセルでは前のbankを保持します。Webはcombined VABの取込例です。
公開API自体は `readVab(vhBytes, vbBytes)` によるsplit VH / VBにも対応しています。
Webだけhost gain 0.6を1回掛け、終了時に8 msのソフトウェア出力fadeを使います。
元のADSRやVABの音量metadataは変更しません。

## Node：WAVだけを保存

```sh
node examples/ps1/spu/03-vab-bank/node/main.mjs
node examples/ps1/spu/03-vab-bank/node/main.mjs ./tone.wav --program 3 --tone 1
node examples/ps1/spu/03-vab-bank/node/main.mjs ./hit.wav --program 11 --tone 0
node examples/ps1/spu/03-vab-bank/node/main.mjs ./voice.wav --input ./my-bank.vab --program 3 --tone 0 --export-vab ./selected.vab
```

[全コード](node/main.mjs) は公開npmだけを使う1ファイルです。既定の入力は同梱demo、
Programはbankの最初、Toneは0、出力は `output/ps1-spu-03-vab-bank.wav` です。
Programは元のProgram番号、`--tone` はそのProgram内のTone番号です。
`--export-vab` は明示した場合だけ選択Toneを書き出します。

C4・E4・G4・C5を各0.45秒発音、各0.15秒Releaseし、最後にStop後の完全な無音0.2秒を加えます。
44,100 Hz・stereo PCM16・2.6秒。ADSRや声の音量を上書きせず、正規化しません。
既存の出力ファイルは上書きします。入力VABと同じファイルへの出力は拒否します。
不正な引数・VAB・Toneは出力前に検証します。
AudioContext・音声デバイス・audify・ダウンロード・WASM再ビルドは不要です。

## APIと保持するもの

```js
const bank=readVab(bytes);
const toneNumber=bank.tones.findIndex(t=>t.program===3&&t.index===0);
const prepared=prepareVabTone(bank,toneNumber);
const instrument=spu.loadADPCM(prepared.adpcm,prepared.options);
spu.setPreset(0,{...prepared.preset,sample:instrument});
const selectedBytes=exportVab(bank,{toneNumber});
```

- `prepareVabTone()` の番号は `bank.tones` 全体のindexです。元Program番号とは違います。
- 元ADPCMを復号・再符号化せず、最初のENDまでをuploadします。以降のpaddingは元bankに残ります。
- 調律はVABのcenter / fine shiftから得る `baseFrequencyHz`、loopは元packetとloop位置を使います。周波数の自動推定はしません。
- ADSR・静的な音量/pan・reverb sendを利用します。音量/panはlibsnd風の近似です。共有reverbはOffで、send metadataを保持してもwet音は足しません。
- key zoneの重ね合わせ、vibrato、portamento、ゲームドライバーの変化、曲再生はこの例の対象外です。未割当sampleやlibsnd Noise Toneなどは理由付きで拒否します。
- `exportVab(bank)` は元bank全体をbyteそのままで保存します。`{toneNumber}` は元Program IDとraw属性を保持し、Tone 0 / Sample 1へ詰めた標準VABを作ります。sampleのEND後paddingも保持します。
- exportは `readVab()` が返した未変更のbank用です。編集したSynthからVABを生成する機能ではありません。

```sh
npm run check:vab:node
```

ループ2Tone・一発音・標準VAB exportの属性/調律/padding・不正入力・Stop後無音を、実SPUのPCMとファイルだけで検証します。

[自作サンプルとADSR](../01-sample-adsr/README.md) / [共有reverb](../02-reverb/README.md) / [repository README](../../../../README.md)

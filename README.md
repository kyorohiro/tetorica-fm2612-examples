# tetorica-fm2612 examples

`tetorica-fm2612` を import して使う、機能別の小さなサンプル集。
公開済み npm `tetorica-fm2612@0.2.21` を使用します。チップ別の基本例は WorkletTransport / AudifyTransport、DX7・SNES・PC Engine の Web 演奏は Playground Runtime を使います。導入手順は末尾の「Transport の例」を参照してください。
PCM 生成・WAV 保存は専用例に置き、Web Audio を使う埋め込み例と、Node の nativeFX / 音声デバイス出力の例も掲載しています。本体リポジトリには依存しません。

[公開 examples](https://kyorohiro.github.io/tetorica-fm2612-examples/) と
[Runtime の構成と選び方](public/runtime.html) から読み始められます。

パッケージ本体の説明・API の使い方・配布設定は
[hello_ymfm_wasm/packages/fm2612](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612)
を参照してください。

## API を探す

機能から import 先を探すには、パッケージ README の
[API entry points](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)
を参照してください。チップ生成・Synth・Transport・音程変換・WAV・音色ファイルなどの入口を一覧にしています。

例えば Hz を YM2612 の BLOCK/FNUM に変換する helper は、ルートではなく `pitch.js` から import します。

```js
import {hzToBlockFnum} from 'tetorica-fm2612/pitch.js';
const {block, fnum} = hzToBlockFnum(440);
```

引数・options・戻り値はインストール済みの `.d.ts` / `.d.mts` と、エディターの補完・定義へ移動で確認できます。
例えば `node_modules/tetorica-fm2612/pitch.d.ts` です。各例の README と実際のコードも併せて参照できます。

## 起動

Node.js 22 以降で repository ルートから実行します。

```sh
npm install
npm run dev
```

http://127.0.0.1:5173 の一覧から Web 版を開いて Play を押します。
`PORT=8080 npm run dev` でポートを変更できます。

## サンプル一覧

| 分類 | サンプル | 学ぶこと |
| --- | --- | --- |
| FM | [01-single-note](examples/genesis/fm/01-single-note/README.md) | preset / noteOn / noteOff |
| FM | [02-melody](examples/genesis/fm/02-melody/README.md) | 音程と音符の長さ |
| FM | [03-presets](examples/genesis/fm/03-presets/README.md) | sine / bell / organ の比較 |
| FM | [04-operators](examples/genesis/fm/04-operators/README.md) | algorithm / operator |
| FM | [05-stereo-pan](examples/genesis/fm/05-stereo-pan/README.md) | 左・右・両側の出力 |
| FM | [06-chord](examples/genesis/fm/06-chord/README.md) | 複数チャンネルで和音 |
| DX7（Web） | [01-notes](examples/dx7/01-notes/README.md) | MIDI ノート番号でメロディと和音、Main / Worker の切替 |
| DX7（Web） | [02-sysex](examples/dx7/02-sysex/README.md) | 1音色 / 32音色の SysEx 読込み、音色選択、試聴 |
| SNES（実験用・Web / Node） | [01-brr-notes](examples/snes/01-brr-notes/README.md) | 自作 BRR、基準音程、8ボイス、Main / Worker、Node WAV |
| SPC（実験用・Web / Node） | [02-spc-player](examples/snes/02-spc-player/README.md) | SPC700＋S-DSP の再生・停止、32kHz PCM / WAV |
| Chip raw | [01-register-note](examples/chip-raw/01-register-note/README.md) | YM2612 レジスタ直接操作 |
| PSG | [01-tone](examples/genesis/psg/01-tone/README.md) | Sega PSG のトーン |
| PSG | [02-noise](examples/genesis/psg/02-noise/README.md) | 周期 / ホワイトノイズ |
| PCM | [01-wav-export](examples/genesis/pcm/01-wav-export/README.md) | Float32 PCM と WAV 出力 |
| AudioWorklet | [01-note](examples/audio-worklet/01-note/README.md) | 音声スレッドで FM 発音、初期化・停止・解放 |
| PC-98 | [01-note](examples/pc98/fm/01-note/README.md) | PC-98 YM2608 の FM 発音 |
| PC-98 | [01-tone](examples/pc98/ssg/01-tone/README.md) | PC-98 YM2608 の SSG トーン |
| PC Engine | [01-waveform](examples/pc-engine/wave/01-waveform/README.md) | 32点・5-bit波形、メロディ、左右Pan |
| PC Engine | [01-noise](examples/pc-engine/noise/01-noise/README.md) | CH4・5のNoise、周波数コード、左右Pan |
| PC Engine | [01-modulation](examples/pc-engine/lfo/01-modulation/README.md) | CH1からCH0へのハードウェアLFO |
| Game Boy | [01-duty](examples/gameboy/pulse/01-duty/README.md) | Game Boy pulse のデューティ比 |
| Game Boy | [01-waveform](examples/gameboy/wave/01-waveform/README.md) | Game Boy wave の波形メモリー |
| Game Boy | [01-width](examples/gameboy/noise/01-width/README.md) | Game Boy noise の幅 |
| NES | [01-tones](examples/nes/apu/01-tones/README.md) | 2つの pulse・triangle のベース・noise の打音を重ねる。 |
| NES | [01-wave-modulation](examples/nes/fds/01-wave-modulation/README.md) | 64点の波形を作り、変調なし／ありの音色を比較する。 |
| NES | [01-sample](examples/nes/dmc/01-sample/README.md) | 自作の1-bit DPCM データをメモリーへ送り、再生速度を比較する。 |
| X68000 | [01-note](examples/x68000/fm/01-note/README.md) | X68000 YM2151 の FM 発音 |
| X68000 | [01-byte-stream](examples/x68000/adpcm/01-byte-stream/README.md) | X68000 OKIM6258 の ADPCM 再生 |
| PC-98 | [01-rhythm](examples/pc98/adpcm-a/01-rhythm/README.md) | YM2608 ADPCM-A：固定リズム音源 |
| PC-98 | [01-sample](examples/pc98/adpcm-b/01-sample/README.md) | YM2608 ADPCM-B：サンプルメモリ再生 |
| PC-98 | [02-load-sample](examples/pc98/adpcm-b/02-load-sample/README.md) | YM2608 ADPCM-B：PCM / WAV の loadSample |
| Embedding（Web / Node） | [01-megasynth-fx](examples/embedding/01-megasynth-fx/README.md) | MegaSynth の発音、delay / reverb、終了 |
| Embedding（Web） | [02-event-recording](examples/embedding/02-event-recording/README.md) | 音源操作をイベント JSON に録音、import / 再生 |
| Embedding（Web） | [03-looper](examples/embedding/03-looper/README.md) | 音符の録音、ループ、undo / 停止 |
| Embedding（Web） | [04-playground-worker](examples/embedding/04-playground-worker/README.md) | Playground のコードを Worker で実行 |
| Embedding（Web / Node） | [05-vgm-player](examples/embedding/05-vgm-player/README.md) | 自作 PSG VGM / 手元の VGM の再生、Node WAV 出力 |
| Patches（Web / Node） | [01-tfi-roundtrip](examples/patches/01-tfi-roundtrip/README.md) | TFI の import / export、音色の発音 |
| Patches（Web / Node） | [02-vgi-roundtrip](examples/patches/02-vgi-roundtrip/README.md) | VGI の import / export、音色の発音 |

| Embedding（Node・実験用） | [06-megasynth-offline-fx](examples/embedding/06-megasynth-offline-fx/README.md) | FM / nativeFX / WAV |
| Embedding（Node・実験用） | [07-megasynth-node-recording](examples/embedding/07-megasynth-node-recording/README.md) | サンプル時計・イベント JSON・再演 |
| Embedding（Node・実験用） | [08-megasynth-node-looper](examples/embedding/08-megasynth-node-looper/README.md) | イベント looper・undo・停止 |
| Embedding（Node・実験用） | [09-megasynth-node-pcm-looper](examples/embedding/09-megasynth-node-pcm-looper/README.md) | PCM 録音・native mixer・dry / FX WAV |
| Embedding（Node・実験用） | [10-megasynth-node-audio](examples/embedding/10-megasynth-node-audio/README.md) | Worker 内のリアルタイム出力・録音・停止・再開 |

| DirectTransport | [01-single-note](examples/transport/direct/01-single-note/README.md) | PCM 生成・Web 再生・Node WAV 保存 |

| Chip Mixer（Web） | [11-chip-mixer](examples/embedding/11-chip-mixer/README.md) | 自動 ID・チップ別 Volume / Pan / Mute / Reset |

## 各フォルダーの構成

```text
examples/genesis/fm/01-single-note/
├── README.md
├── web/
│   ├── index.html
│   └── main.js       npm import → WorkletTransport → 音源操作 → 発音・終了
└── node/
    └── main.mjs      npm import → AudifyTransport → 音源操作 → 発音・終了
```

各ファイルに必要なコードをすべて記述します。サンプル間や Web / Node 間の
重複はそのまま残し、共通の音源処理・再生ヘルパーは使いません。
パッケージと実行環境の標準 API だけを使用します。
ブラウザ専用の例は `node/` を置かず、一覧と README に実行環境を明記します。

`generateStereo(frames)` で PCM を生成してチップの時間を進めます。
チップ別の基本例は WorkletTransport でリアルタイムに発音します。
DirectTransport / PCM の専用例では生成済み PCM を再生します。
AudioWorklet の例は processor が音声スレッドで PCM を生成します。
基本例の Node 版は AudifyTransport による同じ音源操作のリアルタイム再生です。
オフライン生成は DirectTransport / PCM の専用例で説明します。
オフライン生成の例には PCM の連結と、npm package の `encodeWav()` による WAV 出力も載せています。
AudioWorklet の Web 版には ready 待機と transport・node・AudioContext の解放を載せています。

## Node 版

```sh
node examples/genesis/fm/01-single-note/node/main.mjs
node examples/transport/direct/01-single-note/node/main.mjs ./note.wav
```

DirectTransport / PCM の Node 例は `output/<サンプル名>.wav` に保存します。チップ別の基本例は audify の音声デバイスへ出力します。
オフラインの Node 版に AudioContext や音声ドライバーは不要です。リアルタイム出力例だけは audify と音声デバイスを使います。
WAV をスピーカーで聴く場合は音声プレイヤーで開いてください。
Web と Node の音源操作は同等ですが、各ファイルにそれぞれ記述しています。

## ビルド

```sh
npm ci
npm run build
```

静的サイトを `dist/` に生成します。すべての Web ページ、音源コード、
Node ソース、説明を同梱します。相対 URL を使うので
GitHub Pages の repository 配下にも配置できます。公開は別途行ってください。

npm package の全内容も `vendor/tetorica-fm2612/` にコピーします。
import map で bare import を解決し、JS / WASM / Worker / Worklet の配置と
ライセンス・同梱ソースを保ちます。バンドラーや CDN は使用しません。
`public/vendor/`、`dist/`、`output/` は生成物で、git 管理しません。

`createSoundChip('ym2612')` などの factory は、Web / Node ともに WASM を自動で読み込みます。
Sega PSG・Game Boy・OKIM6258 の個別ラッパーと AudioWorklet の例では、
ローダーや WASM の転送手順を明示しています。
WAV 出力には package の `encodeWav(pcm, {gain: 0.25})` を使います。

## サンプルを追加する

機能の分類内にフォルダーを作り、`web/`、`node/`、README を置きます。
一覧の原本は `examples/manifest.json` です。そこにタイトルと説明を追加すると
Web の一覧にも表示されます。ビルドで examples フォルダー全体を配布します。
Node 専用の場合は `environments: ["node"]`、ブラウザ専用の場合は `environments: ["web"]`、Web / Node の両方を持つ場合は
`environments: ["web", "node"]` を指定できます。省略時は従来の Web / Node 例として扱います。

## License

サンプルコードは BSD-3-Clause。ランタイムの第三者ライセンスは
配布パッケージ内の `THIRD_PARTY_LICENSES.txt`、`licenses/`、`sources/` を参照してください。

## MegaSynth Node examples

`embedding/06`〜`10` は `tetorica-fm2612@0.2.21` の実験用 MegaSynth API を使います。
通常の `npm ci` で公開 package を導入できます。

```sh
npm ci
node examples/embedding/06-megasynth-offline-fx/node/main.mjs
node examples/embedding/07-megasynth-node-recording/node/main.mjs
node examples/embedding/08-megasynth-node-looper/node/main.mjs
node examples/embedding/09-megasynth-node-pcm-looper/node/main.mjs
npm install --no-save --package-lock=false audify
node examples/embedding/10-megasynth-node-audio/node/main.mjs
```

06〜09 は音声デバイス不要、10 は audify による Worker 内リアルタイム出力です。
各例は独立したファイルに処理をすべて記述し、package の export だけを import します。
一覧では Node source / README のみを表示し、Web へのリンクは付けません。
Node オフライン例は `npm run check:node` で検証できます。
WAV の RIFF ヘッダー・非ゼロ PCM とイベント JSON を確認します。
音声デバイスを使うチップ別の基本例と embedding/01・10の Node 例は、このコマンドには含めません。

## Transport の例

Genesis / PC-98 / Game Boy / X68000 FM の基本例は、WorkletTransport / AudifyTransport を使用します。
公開済み npm 0.2.21 を使用します。Node のリアルタイム再生には audify を追加してください。

```sh
npm install
npm install --no-save audify
npm run dev
node examples/genesis/fm/01-single-note/node/main.mjs
```

基本例の Web は Worklet 内でチップを動かし、Main で Synth / Transport を使います。
Node は呼び出し元でチップ / Synth を動かし、AudifyTransport がデバイス出力を担当します。
MegaSynth のゲーム埋め込み例は別枠で維持します。
[DirectTransport の専用例](examples/transport/direct/01-single-note/README.md) に PCM 生成と WAV 保存を分けています。
基本例の Node 版は音声デバイスを使うため `check:node` の WAV 出力検証には含めません。

## Chip Mixer

Web の `SoundChipMixer` でチップ別の音量・Pan・Mute を設定できます。`createSoundChip()` の `id` は省略でき、生成後の `chip.id` から取得できます。Game Boy は初期音量28%です。
[複数チップの実行例](examples/embedding/11-chip-mixer/README.md) と MegaSynth / Playground Worker の例を参照してください。

## YM2151 の高水準 API

`YM2151Synth` は Web / Node 共通で `setPreset(0, FM_PRESETS.sine)`、`noteOn(0, 'A4')`、`noteOff(0)` を使えます。[X68000 の基本例](examples/x68000/fm/01-note/README.md) で Worklet / Audify の使い方を示しています。DirectTransport では PCM を生成できます。

## PC Engine / HuC6280

`pc-engine/` の3例は公開済み `tetorica-fm2612@0.2.21` を使います。
Web は `Playground({chip:'huc6280'})` の主音源 `pce` を Main / Worker から操作します。
Node は `Huc6280AudioEngine` → `Huc6280DirectTransport` → `Huc6280Synth` でPCMを生成し、WAVへ保存します。音声ドライバーは不要です。
package root の `createSoundChip('huc6280')` や専用 AudifyTransport は使いません。

物理6CH、各32点・0〜31の波形、音量0〜31、左右Pan0〜15です。
Noiseは0始まりのCH4・5のみ。LFOはCH1の波形でCH0を変調します。
波形の書き込みは対象CHを停止するため、その後に `noteOn()` / `keyOn()` します。
ゲーム由来のROMや波形ファイルは使わず、コード内で波形を作ります。

```sh
node examples/pc-engine/wave/01-waveform/node/main.mjs
node examples/pc-engine/noise/01-noise/node/main.mjs
node examples/pc-engine/lfo/01-modulation/node/main.mjs
npm run build
npm run check:pcengine
```

`check:pcengine` はChromium / WebKitのMain / Workerで実際の出音、
初期化中・演奏中のStop、コード編集後の再実行、音声リソース解放を確認します。

## DX7

`dx7/01-notes` と `dx7/02-sysex` はブラウザ専用で、`Playground` の script 内の
`useSoundChip('dx7')` を使います。package root の `createSoundChip()` と別の入口です。
両方とも Main / Worker を選べ、音声生成は AudioWorklet 内で行います。
最大16ボイス、MIDI ノート番号・velocity は0..127、channel 引数はありません。

最初の例は外部音色不要の `INIT SINE`、次の例は自作32音色バンクを同梱しています。
手元の1音色 / 32音色 SysEx `.syx` も読み込めます。第三者の音色集は配布しません。
Node で直接 DX7 PCM を生成する場合は別 package `tetorica-msfa-dx7-wasm` を使用します。

ブラウザの回帰確認には Playwright のブラウザーを導入してから実行します。

```sh
npm exec playwright install chromium webkit
npm run build
npm run check:dx7
```

実際の出力音声、Main / Worker、音色選択、不正な SysEx、読込み中の Stop と再実行を確認します。

## SNES / SPC（実験的実装）

`snes/01-brr-notes` は自作 BRR を `useSoundChip('snes')` で演奏します。
Web は Main / Worker を選択でき、Node は独立した `SnesDspCore` と `SnesSynth` で WAV を生成します。
BRR 自体に基準音程はないため、`rootNote` または `baseFrequencyHz` を指定します。
チャンネルは0〜7の固定8ボイスで、ADSR/GAIN はハードウェアの値です。

`snes/02-spc-player` は SPC700 CPU と S-DSP を動かすファイル再生の例です。
手元の SPC を選ぶか、未選択なら同梱の自作テスト SPC を再生します。
Web は `SpcRuntimeSynth`、Node は `SpcCore` を使用します。
内部 PCM は **32,000 Hz ステレオ**で、Web のデバイス出力時だけリサンプリングします。

**実験的実装です。** 実ゲーム SPC・Tauri・長時間再生の互換性確認は継続中で、新 API や挙動が変わる場合があります。
ゲーム音楽・ゲーム由来サンプル・Nintendo IPL ROM は同梱しません。
`snes_spc` の LGPL 表示、改変済みソース、ビルド手順は vendor 内に含まれます。

```sh
node examples/snes/01-brr-notes/node/main.mjs
node examples/snes/02-spc-player/node/main.mjs
npm run build
npm run check:snes
```

`check:snes` は上の DX7 と同じ Playwright の Chromium / WebKit を使い、
サブパス配置での BRR 演奏・Main / Worker・初期化中の Stop・SPC の
Pause / Resume・音量・不正ファイル後の再実行を確認します。

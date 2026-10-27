# tetorica-fm2612 examples

`tetorica-fm2612` を import して使う、機能別の小さなサンプル集。
公開済み npm `tetorica-fm2612@0.2.31` を使用します。チップ別の基本例は WorkletTransport / AudifyTransport、DX7・SNES・PC Engine・MSX 合奏の Web 演奏は Playground Runtime を使います。導入手順は末尾の「Transport の例」を参照してください。
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
| OPL系 | [01-models](examples/opl/fm/01-models/README.md) | YM3526 / YM3812 / Y8950 FM / YMF262で音名から演奏 |
| OPL2 | [01-operators](examples/opl2/fm/01-operators/README.md) | 2-op FM・加算・波形・AM / Vibrato |
| OPL2 | [01-drums](examples/opl2/rhythm/01-drums/README.md) | 5種類のハードウェアRhythm |
| OPL3 | [01-four-operators](examples/opl3/fm/01-four-operators/README.md) | 4-opペア・4アルゴリズム・Stereo |
| Master System | [01-instruments](examples/master-system/opll/01-instruments/README.md) | OPLLの内蔵音色・共有User patch・Sega PSG伴奏 |
| Master System | [02-rhythm](examples/master-system/opll/02-rhythm/README.md) | OPLLの5種類の打楽器とメロディー |
| MSX / AY | [01-tone-noise](examples/msx/ay/01-tone-noise/README.md) | 3CHのトーン・共有ノイズ・ミキサー |
| MSX / AY | [02-envelope](examples/msx/ay/02-envelope/README.md) | 共有エンベロープの周期・波形・再トリガー |
| MSX | [01-duet](examples/msx/music/01-duet/README.md) | AY＋OPLL合奏、Main / Worker、Node WAV |
| MSX Audio | [01-three-chips](examples/msx-audio/fm/01-three-chips/README.md) | AY＋OPLL＋Y8950 FM合奏、Main / Worker、Node WAV |
| PC Engine | [01-waveform](examples/pc-engine/wave/01-waveform/README.md) | 32点・5-bit波形、メロディ、左右Pan |
| PC Engine | [01-noise](examples/pc-engine/noise/01-noise/README.md) | CH4・5のNoise、周波数コード、左右Pan |
| PC Engine | [01-modulation](examples/pc-engine/lfo/01-modulation/README.md) | CH1からCH0へのハードウェアLFO |
| WonderSwan | [01-four-channels](examples/wonderswan/wave/01-four-channels/README.md) | 32点・4-bit波形、4CHのメロディ、左右Volume |
| WonderSwan | [01-noise-sweep](examples/wonderswan/noise/01-noise-sweep/README.md) | CH3のNoise・LFSRの種類、CH2のSweep |
| WonderSwan | [01-timed-pcm](examples/wonderswan/voice/01-timed-pcm/README.md) | 自作12kHz Voice PCM、音声スレッドでの時刻付き予約 |
| POKEY | [01-four-channels](examples/pokey/tone/01-four-channels/README.md) | 4物理CHのトーン、音名・音量・メロディ |
| POKEY | [01-distortion-joined](examples/pokey/noise/01-distortion-joined/README.md) | Distortion・poly9とpoly17、結合タイマー・high clock |
| Dual POKEY | [01-eight-channels](examples/pokey/dual/01-eight-channels/README.md) | 2つの独立した音源、4+4CHの合奏・片側の停止 |
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
| Mixer プリセット比較（Web） | [12-calibrated-mixer](examples/embedding/12-calibrated-mixer/README.md) | FM・Sega PSG・AY・NESの従来値 / calibrated を聴き比べる |

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

GitHub Pages 用の管理対象 `docs/` も同じ内容で更新する場合は、`npm run build:docs` を実行します。このコマンドはローカルの生成物を更新し、アップロードは行いません。

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

`embedding/06`〜`10` は `tetorica-fm2612@0.2.31` の実験用 MegaSynth API を使います。
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
公開済み npm 0.2.31 を使用します。Node のリアルタイム再生には audify を追加してください。

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

音源間の音量を測定値から合わせる場合は、任意で `calibrated` プリセットを指定します。

```javascript
import {createSoundChip, SoundChipMixer, SOUNDCHIP_MIXER_PRESETS} from 'tetorica-fm2612';

const mixer = new SoundChipMixer(SOUNDCHIP_MIXER_PRESETS.calibrated);
const chip = await createSoundChip('segapsg', {
  execution: 'worklet', mixer, audioContext, signal,
});
```

[プリセットの比較例](examples/embedding/12-calibrated-mixer/README.md) では、FM・Sega PSG・AY・NESを同じ440 Hzで順に鳴らします。従来値と `calibrated` を選び、表示される倍率と音量差を確認できます。0.2.27ではSega PSG・AY・NESの倍率を再調整しています。Mixerやプリセットを使わない基本例の音量は従来どおりです。

```sh
npm run build
npm run check:mixer
```

## YM2151 の高水準 API

`YM2151Synth` は Web / Node 共通で `setPreset(0, FM_PRESETS.sine)`、`noteOn(0, 'A4')`、`noteOff(0)` を使えます。[X68000 の基本例](examples/x68000/fm/01-note/README.md) で Worklet / Audify の使い方を示しています。DirectTransport では PCM を生成できます。

## OPL / OPL2 / Y8950 FM / OPL3

`tetorica-fm2612@0.2.31` の `OPLSynth` とオリジナル音色 `OPL_PRESETS` を使います。
Webは `createSoundChip(name, {execution:'worklet'})` → `OPLWorkletTransport` → `OPLSynth` でリアルタイム再生。
Nodeは `OPLDirectTransport` と `generateStereo()` でPCMを生成し、WAVへ保存します。音声デバイスや `audify` は不要です。
Webのコード欄を編集して再実行でき、Stopは読み込み中にも使えます。

物理CHは0始まりで9CH、OPL3は18CHです。OPL3の4-opはprimaryのCH0〜2・9〜11と、その3つ後のCHを組にします。
ペアの4オペレーターはprimaryから操作します。左右の出力を選べるのはOPL3だけで、monoのチップは同じ音を両側に出します。
このOPLの4例ではY8950のFM部分を扱います。YM2413 / OPLLは次節のMaster System / MSXの例を参照してください。

```sh
node examples/opl/fm/01-models/node/main.mjs
node examples/opl/fm/01-models/node/main.mjs ./y8950.wav y8950
node examples/opl2/fm/01-operators/node/main.mjs
node examples/opl2/rhythm/01-drums/node/main.mjs
node examples/opl3/fm/01-four-operators/node/main.mjs
npm run build
npm run check:opl
```

`check:opl` はChromium / WebKitで出音・音程・OPL3の左右Pan、
初期化中／演奏中のStop、編集後の再実行、音声リソース解放を確認します。

## AY / OPLL / MSX

6例は `tetorica-fm2612@0.2.31` の AY / OPLL API を使います。
MSX は AY-3-8910＋YM2413、MSX Audio はさらに Y8950 の FM 部分を加えた構成です。
Master System の2例は YM2413 を使い、音色比較では Sega PSG も伴奏します。

AY の3CHは1つのノイズ源とエンベロープを共有します。
OPLL の内蔵音色は1〜15、User patchは0で、その8レジスタを全User音色CHで共有します。
OPLLのRhythmモードはメロディーCH6〜8を5つの打楽器に切り替えます。
チャンネルは0始まり、音名の A4 は MIDI 69＝440 Hz です。

WebはAudioWorkletで音声を生成し、コード編集・初期化中や演奏中のStop・再実行に対応します。
MSX合奏はPlaygroundのMain / Workerを選べます。NodeはDirectTransportでPCMを生成し、
複数音源の合奏では各音源を共通の44.1kHzへ変換してWAVに保存します。

```sh
node examples/msx/ay/01-tone-noise/node/main.mjs
node examples/master-system/opll/01-instruments/node/main.mjs
node examples/msx/music/01-duet/node/main.mjs
node examples/msx-audio/fm/01-three-chips/node/main.mjs
npm run build
npm run check:msx
```

`check:msx` はPlaywrightのChromium / WebKitを使い、repository配下の配置、実際の出力音声、
編集コード、初期化中／演奏中のStop、終了処理と再実行を確認します。
ブラウザー未導入時は `npm exec playwright install chromium webkit` を実行してください。

## PC Engine / HuC6280

`pc-engine/` の3例は公開済み `tetorica-fm2612@0.2.31` を使います。
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

## WonderSwan

3例は `tetorica-fm2612@0.2.31` の共通factoryを使います。
Webは `createSoundChip('wonderswan', {execution:'worklet'})` → `WonderSwanWorkletTransport` → `WonderSwanSynth`。
NodeはDirect生成したチップを `WonderSwanDirectTransport` → `WonderSwanSynth` へ渡し、WAVに保存します。
物理4CH、32点・4-bit波形、左右Volumeは各0〜15。VoiceはCH1、SweepはCH2、NoiseはCH3を使います。

Voice例は自作の1秒・12kHz PCMをまとめて `scheduleWrites()` へ送り、ACK後に開始します。
PCMの各バイトへJavaScriptのタイマーを使わず、Stopで予約も消します。
Webは既存の音声エンジンの中心値補正を使い、Nodeはunipolar DAC/DC成分を残したraw WAVです。
音量校正や正規化は行わず、HyperVoice・音声DMA・内蔵スピーカーは扱いません。
ゲームROM・BIOS・ゲーム音楽は同梱しません。

```sh
node examples/wonderswan/wave/01-four-channels/node/main.mjs
node examples/wonderswan/noise/01-noise-sweep/node/main.mjs
node examples/wonderswan/voice/01-timed-pcm/node/main.mjs
npm run build
npm run check:wonderswan
```

`check:wonderswan` はChromium / WebKitの実際の音声出力を測定します。
4CH・Noise・Sweep・Voiceの非ゼロで有限のPCM、A4・左右出力、初期化中／演奏中のStop、
予約されたVoice PCMの取消し、編集後の再実行、終了後の音声リソース解放を確認します。

## POKEY / Dual POKEY

3例は公開済み `tetorica-fm2612@0.2.31` の共通factoryと `PokeySynth` を使います。
Webは `createSoundChip('pokey', {execution:'worklet'})` → `PokeyWorkletTransport` → `PokeySynth`。
コードを編集して再実行でき、Stop・終了・ページ移動で音源とAudioContextを解放します。読み込み中のStopにも対応します。

物理CHは0〜3、Volumeは0〜15、distortion 5が基本の矩形波です。
ノイズのpoly9/poly17・base clock・join等は共通の設定なので、変更前に発音を止めます。
結合ペアは下側がtimer helper、上側（CH1/CH3）が発音します。音名から設定した音程はタイマーの分解能に合わせて量子化されます。

Dual例は独立した4CH音源を2台作り、4+4CHを合奏します。両方ともmonoで、ホストで加算します。
単体のclockは1,789,790 Hz、Dual例はそれぞれ1,789,773 Hzです。
いずれも自作の短いフレーズを使い、ゲームデータを必要としません。

Nodeは `PokeyAudioEngine` の10 Hz DC blockerを通したPCMを44,100 Hz stereo PCM16 WAVへ保存します。
Synthからのレジスター書き込みもengineを経由させます。Webも汎用Worklet内で同じ出力処理を使います。
出力gainはWeb / Nodeとも明示的に0.25を1回だけ掛け、正規化や音源別の音量校正は行いません。

```sh
node examples/pokey/tone/01-four-channels/node/main.mjs
node examples/pokey/noise/01-distortion-joined/node/main.mjs
node examples/pokey/dual/01-eight-channels/node/main.mjs
npm run build
npm run check:pokey
npm run check:node
```

`check:pokey` はChromium / WebKitで、実際の出力PCM・4CH/2台の命令・音程・ノイズ/結合設定・Stop・編集後の再実行を検査します。
`npm run build:docs` でGitHub Pages用の `docs/` にも、コード・WASM・ライセンス・対応ソースを含めて生成します。

# POKEY：4CHの矩形波とメロディ

4つの物理チャンネルを使い、純音distortion 5で短いオリジナルフレーズを鳴らします。
フレーズはこの例のためのオリジナルです。ROM・BIOS・外部音楽データは使用しません。
`tetorica-fm2612@0.2.31` の共通factory、PokeySynth、Transport、PokeyAudioEngineを使います。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。Playのユーザー操作でAudioContextを作り、音声を開始します。

```js
const chip = await createSoundChip('pokey', {execution: 'worklet', audioContext, signal, clock: 1789790, gain: 0.25});
const transport = new PokeyWorkletTransport(chip);
const pokey = new PokeySynth({transport, clock: chip.clock});
pokey.initialize(); // Silent; physical channels 0..3, distortion 5 = square.
await transport.start();
```

SynthはMain、実コアとPCM生成はAudioWorkletで動きます。コード欄は編集して再実行できます。
各Playは新しいコアとAudioContextを使い、終了・Stop・エラー・ページ移動で予約と音声リソースを解放します。
読み込み中もStopでき、初期化が遅れて完了したendpointも回収します。
WASM・Worklet・ライセンスはインストール済みnpm packageから静的サイトへコピーされます。

## Node

```sh
node examples/pokey/tone/01-four-channels/node/main.mjs
node examples/pokey/tone/01-four-channels/node/main.mjs ./pokey-tone-01-four-channels.wav
```

[全コード](node/main.mjs)。Node.js 22以降。出力先省略時は `output/pokey-tone-01-four-channels.wav` です。
`createSoundChip('pokey', {clock:1789790, sampleRate:44100})` で実コアを作り、
`new PokeyAudioEngine(chip, 1)` → engineを経由する明示的なtransport → `PokeySynth` と接続します。
`engine.processFrames()` で時間を進めるので、AudioContext・audify・音声デバイス・実時間のsleepは不要です。

raw `chip.generateStereo()` は単極性DACのDC成分を含みます。この例はWebのスピーカー出力と同じ
10 Hz DC blockerをunityで通し、gain 0.25を最後に1回だけ掛けて44,100 Hz stereo PCM16 WAVへ保存します。
正規化・音量校正はしません。monoの同じPCMを左右へ複製します。
レジスター書き込みとresetはすべてengine経由にするため、engineのAUDC shadowと実コアが同期し、
`allNotesOff()` 後は完全なゼロになります。最後の0.1秒は無音です。
WebはAudioContextの実サンプルレートとJSタイマー、Nodeは44,100 Hzとフレーム単位のオフライン進行を使うので、
WAVとのビット一致は保証しません。

## 4CHと音程

物理CHは0〜3で、各CHのVolumeは0〜15です。`setVolume()` は消音中の値を保持し、`noteOn()` で発音します。
この例は4CHに異なるVolumeを設定し、`noteOn(channel, note)` で同時に鳴らします。
音名はA4=440 Hz。戻り値が必要なら `setNote()` / `setFrequency()` は量子化されたHzを返します。

初期状態は64 kHz系の8-bitタイマーです。純音の設定可能範囲はこのクロックで約124.8〜31,961 Hzなので、
この例の最低音はC3にしています。低い音には次の[連結タイマー例](../../noise/01-distortion-joined/README.md)が使えます。
`setFrequency()` の値は純音の目標Hzであり、ノイズモードの聴感上の音高を保証するものではありません。

## APIの範囲

入力クロックは1,789,790 Hz、物理CHは0〜3です。`initialize()` は無音で、distortion 5・Volume保持値8を設定します。
Volumeは0〜15、distortionは0〜7です。共有制御を変更すると他のCHにも影響するため、先に全CHを消音します。
レジスターのアドレスはチップ内部の0x00〜0x0fで、Atari CPUのメモリ番地ではありません。
この例は音源コアだけを扱います。CPU・POKEYのPOT/keyboard/serial機能・Atari機器全体をエミュレートするものではありません。

[repository README](../../../../README.md) / [package API](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

コアの出典・BSD-3-Clauseライセンス・改変内容はnpm packageの `licenses/libvgm-pokey/` と
`sources/third_party/libvgm-pokey/` に含まれます。

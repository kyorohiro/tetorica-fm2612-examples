# POKEY：ノイズと16-bit連結タイマー

同じタイマー値でdistortionとpoly9を比較し、CH0＋CH1の連結タイマーで低音を鳴らします。
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
node examples/pokey/noise/01-distortion-joined/node/main.mjs
node examples/pokey/noise/01-distortion-joined/node/main.mjs ./pokey-noise-01-distortion-joined.wav
```

[全コード](node/main.mjs)。Node.js 22以降。出力先省略時は `output/pokey-noise-01-distortion-joined.wav` です。
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

## distortion、poly9、連結ペア

前半はCH0の同じB4タイマーを使い、distortion 5（純粋な矩形波）、2（poly5＋poly4）、
0（poly5＋poly17）、0＋poly9の4段階を比較します。ノイズの聴感上の音高は多項式にも依存します。
B4はpoly9の周期とタイマーの位相が固定される組み合わせを避けた値です。
このクロックでA4を指定するとタイマー周期は2,044クロックで、poly9の511クロック周期の4倍になります。
同じ位相だけを読むためDCとなり、DC除去後は無音になるので、この比較にはB4を使います。コアの不具合ではなく周期の組み合わせによる結果です。
`setPoly9()`、clock、join、filterは共有AUDCTLを変更するので、各変更前に `allNotesOff()` します。

後半は `setHighClock(0, true)` と `setJoined(0, true)` でCH0＋CH1を16-bitタイマーにします。
pair 0はCH0＋CH1、pair 1はCH2＋CH3です。低位CH0/2はタイマー補助として消音され、
発音と周波数設定は上位CH1/3だけが担当します。連結中に下位CHへ `noteOn()` / `setFrequency()` はできません。
この例はCH1だけにC2・G2・C3・E3を設定します。high-clock連結の範囲は約13.65〜127,842 Hzで、これらは有効な値です。

通常の8-bit・64 kHz系タイマーでは約124.8 Hzが下限です。低音のために下位CHを単独でhigh clockにするのではなく、
16-bit連結とhigh clockを組み合わせています。`initialize()` を再実行すれば共有設定を含めて無音の既定状態へ戻ります。

## APIの範囲

入力クロックは1,789,790 Hz、物理CHは0〜3です。`initialize()` は無音で、distortion 5・Volume保持値8を設定します。
Volumeは0〜15、distortionは0〜7です。共有制御を変更すると他のCHにも影響するため、先に全CHを消音します。
レジスターのアドレスはチップ内部の0x00〜0x0fで、Atari CPUのメモリ番地ではありません。
この例は音源コアだけを扱います。CPU・POKEYのPOT/keyboard/serial機能・Atari機器全体をエミュレートするものではありません。

[repository README](../../../../README.md) / [package API](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

コアの出典・BSD-3-Clauseライセンス・改変内容はnpm packageの `licenses/libvgm-pokey/` と
`sources/third_party/libvgm-pokey/` に含まれます。

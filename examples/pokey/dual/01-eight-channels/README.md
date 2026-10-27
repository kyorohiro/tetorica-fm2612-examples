# Dual POKEY：2チップ・8つの実ボイス

独立した4CHコアを2個作り、計8つの実ボイスをホスト側でモノラル加算します。
フレーズはこの例のためのオリジナルです。ROM・BIOS・外部音楽データは使用しません。
`tetorica-fm2612@0.2.31` の共通factory、PokeySynth、Transport、PokeyAudioEngineを使います。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostとAudioWorklet対応ブラウザーが必要です。Playのユーザー操作でAudioContextを作り、音声を開始します。

```js
const chips = [];
for (let i = 0; i < 2; i++) {
  const chip = await createSoundChip('pokey', {execution: 'worklet', audioContext, signal, clock: 1789773, gain: 0.25});
  const transport = new PokeyWorkletTransport(chip);
  const pokey = new PokeySynth({transport, clock: chip.clock});
  pokey.initialize(); // Silent physical CH0..3 on this core.
  chips.push({chip, transport, pokey});
}
await Promise.all(chips.map(({transport}) => transport.start()));
```

SynthはMain、実コアとPCM生成はAudioWorkletで動きます。コード欄は編集して再実行できます。
各Playは新しいコアとAudioContextを使い、終了・Stop・エラー・ページ移動で予約と音声リソースを解放します。
読み込み中もStopでき、初期化が遅れて完了したendpointも回収します。
WASM・Worklet・ライセンスはインストール済みnpm packageから静的サイトへコピーされます。

## Node

```sh
node examples/pokey/dual/01-eight-channels/node/main.mjs
node examples/pokey/dual/01-eight-channels/node/main.mjs ./pokey-dual-01-eight-channels.wav
```

[全コード](node/main.mjs)。Node.js 22以降。出力先省略時は `output/pokey-dual-01-eight-channels.wav` です。
`createSoundChip('pokey', {clock:1789773, sampleRate:44100})` で実コアを作り、
`new PokeyAudioEngine(chip, 1)` → engineを経由する明示的なtransport → `PokeySynth` と接続します。
`engine.processFrames()` で時間を進めるので、AudioContext・audify・音声デバイス・実時間のsleepは不要です。

raw `chip.generateStereo()` は単極性DACのDC成分を含みます。この例はWebのスピーカー出力と同じ
10 Hz DC blockerをunityで通し、gain 0.25を最後に1回だけ掛けて44,100 Hz stereo PCM16 WAVへ保存します。
正規化・音量校正はしません。monoの同じPCMを左右へ複製します。
レジスター書き込みとresetはすべてengine経由にするため、engineのAUDC shadowと実コアが同期し、
`allNotesOff()` 後は完全なゼロになります。最後の0.1秒は無音です。
WebはAudioContextの実サンプルレートとJSタイマー、Nodeは44,100 Hzとフレーム単位のオフライン進行を使うので、
WAVとのビット一致は保証しません。

## 2チップと8ボイス

`createSoundChip('pokey', ...)` を2回呼び、別のコア・レジスター・タイマー・Synthを作ります。
各チップの物理CHは0〜3で、4＋4の8つの実ボイスを同時に鳴らします。
各フレーズの前半0.16秒は8ボイス、続いてAだけを `allNotesOff()` し、後半0.16秒はBの4ボイスが鳴り続けます。
一方のチップの消音が他方に影響しないことも確認できます。最後は両方を消音します。
1チップのチャンネル数を仮想的に増やしたり、同じコアの音をコピーしたりはしません。

両コアの入力クロックは1,789,773 Hzです。POKEYの既定クロック1,789,790 Hzを暗黙に使わず、factoryに明示します。
各Synthには、実コアの `chip.clock` を渡します。音声出力の44,100 Hzとは別の値です。

POKEY自体の出力はmonoで、Panや左右Volumeのレジスターはありません。この例は2チップをホスト側でモノラル加算し、
左右へ同じPCMを出します。左右に分けたい場合はホストのGainNode / ChannelMergerNode等で接続を変更できますが、
それはホスト側のルーティングで、チップのステレオ機能ではありません。
Webは各endpointでgain 0.25、Nodeはunityの2コアPCMを加算後、WAV書き込みでgain 0.25を1回だけ掛けます。
線形処理として同じ出力音量になり、1コアごとの減衰と加算後の減衰を重複させません。

## APIの範囲

入力クロックは1,789,773 Hz、物理CHは0〜3です。`initialize()` は無音で、distortion 5・Volume保持値8を設定します。
Volumeは0〜15、distortionは0〜7です。共有制御を変更すると他のCHにも影響するため、先に全CHを消音します。
レジスターのアドレスはチップ内部の0x00〜0x0fで、Atari CPUのメモリ番地ではありません。
この例は音源コアだけを扱います。CPU・POKEYのPOT/keyboard/serial機能・Atari機器全体をエミュレートするものではありません。

[repository README](../../../../README.md) / [package API](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

コアの出典・BSD-3-Clauseライセンス・改変内容はnpm packageの `licenses/libvgm-pokey/` と
`sources/third_party/libvgm-pokey/` に含まれます。

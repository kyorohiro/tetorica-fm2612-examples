# SCSP：2スロットの sound-stack 変調

公開済み **tetorica-fm2612@0.2.37** の実験的な CPU-free SCSP を使います。
slot 0 を変調器、slot 1 をキャリアとして、ハードウェアの波形アドレス変調を比較します。Depth 0 は変調を切断します。
自作の数式波形のみを使い、SaturnのROM・ゲーム音色・68000・SSFは使いません。

## Web

[実行ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev`。
Playgroundのprimaryを `chip:'scsp'` にして、**Main / Worker** を選択します。
AudioWorklet対応のブラウザーとHTTPSまたはlocalhostが必要です。
コードはそのまま編集でき、変更は次のPlayに反映されます。標準コードは20秒で終了します。
読み込み中のStop・演奏中のStop・終了時に、作成した音声ノードとAudioContextを解放します。
ライブ操作は公開SCSP client / chipInspector経由で送り、Workerの非公開portは使いません。状態読み込みは多重に溜めません。

X / Y は64ワードの sound stack の相対オフセットで、音源スロット番号ではありません。この固定コアは slot-write delay=0。63 / 31 の説明はこの実装の挙動です。物理SCSPと完全に同一のタイミングは主張しません。directLevel=0 は出力だけを消し、変調は残ります。totalLevel は変調の強さにも影響します。DSPエフェクトではありません。

## Node

```sh
node examples/saturn/scsp/03-modulation/node/main.mjs
node examples/saturn/scsp/03-modulation/node/main.mjs ./scsp-03-modulation.wav
```

[Nodeコード](node/main.mjs)はNode.js 22+で、公開npm packageだけから実WASMを読み込みます。
オフラインで44,100 Hz stereo PCM16 WAVを生成します。音声デバイスやaudifyは不要です。
既定の出力は `output/saturn-scsp-03-modulation.wav`。出力ゲイン0.35を最後に一度だけ掛け、正規化しません。
`ScspSynth` は渡した `Scsp` を排他的に所有するため、`saturn.dispose()`で両方を解放します。

## 数値と実装の範囲

- SCSPは**32物理スロット（0〜31）**と512 KiBの共有RAM。自動ボイス割り当てはありません。
- 出力は44,100 Hz固定。Webの実AudioContextレートへの変換は公開runtimeが担当します。
- `setPreset()` / `setEnvelope()` は次回keyOn用。`setMix()` / `setFrequency()` / `setLfo()` / `setModulation()` はライブ更新です。
- `totalLevel` は0〜255の減衰コード（0が最大音量）、`directLevel` は0〜7（0が直接出力ミュート）。
- PCM準備・リサンプル・ガード確保はソフトウェア側の処理。PCM再生・EG・LFO・sound-stack変調がチップ側の機能です。
- 公開APIの範囲に合わせ、DSPエフェクト・delay・SSFの曲再生は扱いません。
- コアはMAME由来の実験的実装。ライセンス・対応ソースはnpm packageの `licenses/` / `sources/` に含まれます。

## 安全な2スロット構成

```js
const sample = saturn.loadPCM(pcm, {
  baseFrequencyHz:44100/64, loopStartSamples:0, modulationDepth:12,
});
saturn.setPreset(0, {sample, directLevel:0});
saturn.setPreset(1, {sample, modulation:{depth:9, xOffset:63, yOffset:63}});
```

WebのloadPCMはPromiseなので `await` が必要です。Nodeの直接コアでは同期です。
変調用PCMは先頭からのフルループが必要で、要求depth以下を確保したガードだけが有効です。
この例はdepth12までの周期的なガードをソフトウェアで確保し、別PCMも隣に読み込みます。
キャリアと変調器は元のhandleを保持し、別サンプル追加でも置き換えられません。
`writeInhibit:true` はstackへの書き込みを止めて古い値を残す指定で、音量ミュートではありません。
2音の和音ではなく、2つの物理スロットを1つの音作りに使っています。

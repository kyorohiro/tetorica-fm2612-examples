# SCSP：PCM8 / PCM16・ループ・32スロット

公開済み **tetorica-fm2612@0.2.40** の実験的な CPU-free SCSP を使います。
ソフトウェアで同じ元波形を signed PCM8 / PCM16 に変換し、SCSP の前進ループで演奏します。選択・音程は再生中にも変更できます。
自作の数式波形のみを使い、SaturnのROM・ゲーム音色・68000・SSFは使いません。

## Web

[実行ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev`。
Playgroundのprimaryを `chip:'scsp'` にして、**Main / Worker** を選択します。
AudioWorklet対応のブラウザーとHTTPSまたはlocalhostが必要です。
コードはそのまま編集でき、変更は次のPlayに反映されます。標準コードは20秒で終了します。
読み込み中のStop・演奏中のStop・終了時に、作成した音声ノードとAudioContextを解放します。
ライブ操作は公開SCSP client / chipInspector経由で送り、Workerの非公開portは使いません。状態読み込みは多重に溜めません。

PCM は signed。PCM16 の RAM 格納は API が big endian に変換します。ループは [loopStartSamples, length)。rootNote / baseFrequencyHz は明示的な調律で、自動検出ではありません。Release は0〜31のハードウェアコードで、変更後に Retrigger してください。

## Node

```sh
node examples/saturn/scsp/01-pcm/node/main.mjs
node examples/saturn/scsp/01-pcm/node/main.mjs ./scsp-01-pcm.wav
```

[Nodeコード](node/main.mjs)はNode.js 22+で、公開npm packageだけから実WASMを読み込みます。
オフラインで44,100 Hz stereo PCM16 WAVを生成します。音声デバイスやaudifyは不要です。
既定の出力は `output/saturn-scsp-01-pcm.wav`。出力ゲイン0.35を最後に一度だけ掛け、正規化しません。
`ScspSynth` は渡した `Scsp` を排他的に所有するため、`saturn.dispose()`で両方を解放します。

## 数値と実装の範囲

- SCSPは**32物理スロット（0〜31）**と512 KiBの共有RAM。自動ボイス割り当てはありません。
- 出力は44,100 Hz固定。Webの実AudioContextレートへの変換は公開runtimeが担当します。
- `setPreset()` / `setEnvelope()` は次回keyOn用。`setMix()` / `setFrequency()` / `setLfo()` / `setModulation()` はライブ更新です。
- `totalLevel` は0〜255の減衰コード（0が最大音量）、`directLevel` は0〜7（0が直接出力ミュート）。
- PCM準備・リサンプル・ガード確保はソフトウェア側の処理。PCM再生・EG・LFO・sound-stack変調がチップ側の機能です。
- 公開APIの範囲に合わせ、DSPエフェクト・delay・SSFの曲再生は扱いません。
- コアはMAME由来の実験的実装。ライセンス・対応ソースはnpm packageの `licenses/` / `sources/` に含まれます。

## PCM8 / PCM16と調律

`prepareScspPCM()`に同じFloat32録音を渡し、選択区間をmonoのsigned `Int8Array` / `Int16Array`へ変換します。
これは**ソフトウェアの編集機能**で、ハードウェアのPCMフォーマット切り替えそのものではありません。
生成波形は28,160 Hzで128点の1周期なので220 Hzです。`rootNote:'A3'`がその調律を明示します。
ループは `[0, 128)`。sample handleは同じSCSP bankにだけ有効で、普通の `loadPCM()` は追記型です。
slot 0 / 1 / 31の切り替えで最後の物理スロットも確認できます。Release codeを変更したらRetriggerしてからKey offしてください。

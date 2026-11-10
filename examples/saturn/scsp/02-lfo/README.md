# SCSP：ハードウェア LFO をライブ操作

公開済み **tetorica-fm2612@0.2.39** の実験的な CPU-free SCSP を使います。
音を押し直さずに、各スロットのハードウェア LFO の速度・波形・ピッチ変調・振幅変調を変更します。
自作の数式波形のみを使い、SaturnのROM・ゲーム音色・68000・SSFは使いません。

## Web

[実行ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev`。
Playgroundのprimaryを `chip:'scsp'` にして、**Main / Worker** を選択します。
AudioWorklet対応のブラウザーとHTTPSまたはlocalhostが必要です。
コードはそのまま編集でき、変更は次のPlayに反映されます。標準コードは20秒で終了します。
読み込み中のStop・演奏中のStop・終了時に、作成した音声ノードとAudioContextを解放します。
ライブ操作は公開SCSP client / chipInspector経由で送り、Workerの非公開portは使いません。状態読み込みは多重に溜めません。

speed は Hz でなく0〜31のレジスタコード。公称0.17〜172.3 Hzです。pitch / AM depth はそれぞれ0〜7。Reset=true は瞬間的なリセットではなく、両方の位相を0で保持します。チェックを外すと進行を再開します。setPreset({lfo}) は次回発音用、setLfo() は再生中にも反映されます。

## Node

```sh
node examples/saturn/scsp/02-lfo/node/main.mjs
node examples/saturn/scsp/02-lfo/node/main.mjs ./scsp-02-lfo.wav
```

[Nodeコード](node/main.mjs)はNode.js 22+で、公開npm packageだけから実WASMを読み込みます。
オフラインで44,100 Hz stereo PCM16 WAVを生成します。音声デバイスやaudifyは不要です。
既定の出力は `output/saturn-scsp-02-lfo.wav`。出力ゲイン0.35を最後に一度だけ掛け、正規化しません。
`ScspSynth` は渡した `Scsp` を排他的に所有するため、`saturn.dispose()`で両方を解放します。

## 数値と実装の範囲

- SCSPは**32物理スロット（0〜31）**と512 KiBの共有RAM。自動ボイス割り当てはありません。
- 出力は44,100 Hz固定。Webの実AudioContextレートへの変換は公開runtimeが担当します。
- `setPreset()` / `setEnvelope()` は次回keyOn用。`setMix()` / `setFrequency()` / `setLfo()` / `setModulation()` はライブ更新です。
- `totalLevel` は0〜255の減衰コード（0が最大音量）、`directLevel` は0〜7（0が直接出力ミュート）。
- PCM準備・リサンプル・ガード確保はソフトウェア側の処理。PCM再生・EG・LFO・sound-stack変調がチップ側の機能です。
- 公開APIの範囲に合わせ、DSPエフェクト・delay・SSFの曲再生は扱いません。
- コアはMAME由来の実験的実装。ライセンス・対応ソースはnpm packageの `licenses/` / `sources/` に含まれます。

## 何を比べるか

Pitch depthとAM depthを0にすると通常のPCM。片方だけ上げるとvibratoとtremoloを分けて確認できます。
速度は0〜31、波形はsaw / square / triangle / noiseです。
`SCSP_LFO_FREQUENCIES_HZ`、`SCSP_LFO_PITCH_CENTS`、`SCSP_LFO_AMPLITUDE_DB`も公開されています。
Resetチェック中は位相0を保持します。振幅・ピッチが必ず無変調になる意味ではなく、選択波形の位相0の値に固定されます。

# ASWAN: 操作・レジスタ・予約演奏

公開npm `tetorica-fm2612@0.2.45`だけを使用します。本体checkoutやゲームデータは不要です。

`npm install` → `npm run dev` → この例のWebを開いてPlay。コードを編集して再Playできます。Play前にはAudioContextを開きません。

1. `build()`で左右音量・Gate・Noiseの操作を記録。
2. `captureState()`の同一snapshotから2つのプログラムを`compile()`し、予測した書き込みを比較。
3. `schedule()`で1秒周期の演奏。
4. 予約後に手動でCH2 GateをOnにし、R90部分更新で保持されることを確認。CH2の音量は0です。

`atSample()`の基準は44100Hz、出力は44.1/48kHzなどデバイスのレートです。`setBpm()`は`beat()`の待ち時間だけを変え、秒指定の予約周期は変えません。予約受付と演奏完了は別です。

Node: `node examples/wonderswan/registers/01-timed-operations/node/main.mjs` は音声デバイスを開かず、reset状態からのレジスタ列・部分更新・再トリガーを検証します。

`compile()`は予測であり実演奏ログではありません。raw GateにソフトウェアReleaseはありません。Nativeの予約、Wave RAM転送、Voice PCM供給、Synth固有のnoteOn/offはこのレコーダーに含まれません。

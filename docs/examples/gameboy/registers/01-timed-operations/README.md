# DMG：Pulse / Wave / Noiseを別周期で予約

公開npm `tetorica-fm2612@0.2.46`だけを使用します。本体checkout、ROM、ゲームデータは不要です。

`npm install` → `npm run dev` → この例のWebを開いてPlay。コードを編集して再Playできます。Play前にはAudioContextを開きません。

1. `build()`でPulseのデューティ比と音階、Wave RAMと音階、Noiseのクロックと幅を記録。
2. 一度の`captureState()`から各プログラムを`compile()`し、音源もsnapshotも変えずにレジスタ書き込みを比較。
3. 3つの名前付き予約を、それぞれ0.5秒・0.75秒・0.25秒で実行。
4. `clearSchedule()`で解除。Stopは読み込み中でも出力を閉じ、予約・クライアント・音源・Contextを破棄します。

これは**ソフトウェアでハードウェア操作を予約する機能**です。各レジスタ書き込みはAudioWorkletの音声サンプル時計で実行します。コードの`beat()`は普通のJavaScript演奏の待機で、`setBpm()`に追従します。`atSeconds()`・`atSample()`・`repeatSeconds`は明示的な時間なのでBPMから独立しています。atSampleの基準は既定44100Hzで、出力デバイスの44.1/48kHzとは別です。

Wave RAMは32点・各0〜15。`stopAndSetWaveform()`は実際のCH3 DACを止めるため、同じ時刻でも**転送→再発音**の順序が必要です。Noiseには通常の音階がなく、divisor・shift・widthでクロック／系列を変えます。raw keyOffやWave転送をソフトウェアのフェードで隠しません。

Webは共有クライアント`createGameboyClient()`を、所有する`createGameboyAudio()`のendpointへ接続します。package-rootの低レベルfactoryとは別のAPIです。表のregisterは0〜0x2fの正規化アドレスで、実機I/Oアドレスは`0xff10 + register`です。表は予測した書き込みであり、実演奏ログではありません。snapshotは操作解決用の状態で、発振器・Envelopeの途中経過を保存しません。

Node:

```sh
node examples/gameboy/registers/01-timed-operations/node/main.mjs
```

音声デバイスやWASMを作らず、同じ初期化状態から2種類の操作を比較します。第1引数にファイル名を渡すと結果をJSON保存できます。ハードウェアresetは電源Off／未初期化の状態で、高レベル操作の通常のinitialize要件を省略しません。

Nativeの予約実行と確定した状態取得は未対応です。`client`基準のコンパイルは予約や他の書き込みを反映していない場合があります。比較したいときは取得済みsnapshotを再利用してください。

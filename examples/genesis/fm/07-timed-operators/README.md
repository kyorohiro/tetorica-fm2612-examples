# YM2612：メロディとOperator予約

`tetorica-fm2612@0.2.41` の公開APIで、メロディと音色変化を別の周期で動かすWeb例です。algorithm 7のOP1だけを鳴らし、TL（音量の減衰量）とMULT（周波数倍率）を32段階で変えます。

## 試す

```sh
npm install
npm run dev
```

[Webページ](web/index.html)を開いてPlayを押します。[全コード](web/main.js)もページ内で読めます。初期コードは120 BPMで約5.25秒の演奏です。ymfm／Nuked-OPN2を選択できます。

1. `setBpm(120)`を60や180に変えて、次のPlayでメロディの速さを比較します。
2. `motionSeconds = 1.5`を変更し、Operatorの変化だけを速く／遅くします。
3. TLの`24 + 32 * wave`やMULTの`1 + Math.round(3 * wave)`を変えて試します。
4. 表とbrowser consoleで、`setOperator()`がport／register／valueへ変換される様子を確認します。

`beat()`はこのページに全コードを記載した、Main側の小さな拍待ちヘルパーです。1拍の秒数は`60 / BPM`です。レジスタごとの変化にはJavaScriptタイマーを使いません。32操作を1つのAudioWorklet予約として送り、音声のサンプル時計で繰り返します。

## 操作を記録・確認・実行する

```js
const operations = fm.build(b => {
  b.atSeconds(0).setOperator(0, 0, {multi: 2});
  b.atSeconds(0.1).setOperator(0, 0, {tl: 48});
});
console.table(await fm.compile(operations, {initialState: 'client'}));
await fm.schedule(operations, {name: 'motion', repeatSeconds: 1});
await fm.clearSchedule('motion');
```

`build()`はコールバックを一度実行して操作を記録します。ライブ状態をコピーせず、音源も変更しません。`compile()`は一時的な状態で操作を解決し、書き込み列を返します。例の`initialState: 'client'`はMain側の書き込みシャドウを使い、Workletへ状態取得を要求しません。予約や外部操作による最新状態を常に含むものではありません。複数の基準を比較する場合は[レジスタ比較例](../../../chip-raw/02-compile-compare/README.md)も参照してください。

実行時には、その時点の音源状態から部分更新を解決します。MULTとDTは同じレジスタを共有しますが、`{multi: 2}`だけなら実行時のDTを保持します。表の結果は指定した基準状態からの予測で、他の操作が割り込んだ実演奏の履歴ではありません。CH／OP番号はAPI上では0始まりです。

## 予約の終了と制限

- `schedule()`のPromiseは受付完了を表し、演奏完了まで待つものではありません。
- 同じ名前を再予約すると、未来の操作を置き換えて周期を再開始します。
- `clearSchedule()`は未来の操作を止めます。すでに適用されたTL／MULTは戻りません。
- このページのStopは出力を消音して、クライアント・Worklet・AudioContextを解放します。初期化の途中やコードのエラーでも同じ後始末を行います。
- 予約は**ソフトウェアの機能**です。音色の演算やEnvelopeはチップの機能です。Atari ST／Genesis本体のCPUをエミュレートする例ではありません。
- この例はWeb専用です。Nativeの予約実行は現行APIでは対象外です。外部ゲームデータは使いません。

## 接続

`createOpnAudio()`で独立したYM2612 Workletを作り、その`endpoint.port`から`createOpnClient('ym2612', ..., {engine})`を作ります。音声生成はWorklet、メロディと編集可能なJavaScriptはMainで動作します。共通の独自フレームワークや親リポジトリの相対importには依存しません。

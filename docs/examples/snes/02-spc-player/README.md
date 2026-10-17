# SPC ファイル再生（実験的）

`tetorica-fm2612` 0.2.20 以降の SPC700 CPU + S-DSP 再生を試す、独立した例です。音色を直接演奏する DSP 単独の例とは別に、SPC ファイル内の RAM・CPU・DSP 状態からドライバーを動かします。

SNES / SPC 対応は**実験的実装**です。実ゲームすべての動作や実機との完全一致は確認していません。

## Web

リポジトリの `npm run dev` で表示した一覧から、この例を開いてください。HTTPS または localhost、AudioWorklet 対応ブラウザーが必要です。

- 未選択なら同梱の `assets/original.spc` を再生します。小さなオリジナル BRR 波形がループする約 2000 Hz の短音です。
- 手元の `.spc` も選択できます。ファイル内容はサーバーへアップロードせず、ブラウザー内で処理します。
- **Pause / Resume** は CPU / DSP の進行と再生位置を維持します。
- **Stop** は読み込み中も使え、AudioWorklet と音声リソースを解放します。次の **Play** は元の SPC から再生し直します。ファイル変更も停止します。
- Vol は再生中に変更できます。再生上限は初期値 10 秒、最大 600 秒です。表示・停止は約 100 ms ごとに確認するため、上限はサンプル精度の予約ではありません。

ブラウザー再生 API は `SpcRuntimeSynth` です。

```js
import {SpcRuntimeSynth} from 'tetorica-fm2612/spc_audio.js';

const player = new SpcRuntimeSynth({masterVolume: 0.35});
await player.loadSPC(new Uint8Array(spcBytes));
await player.play();
await player.pause();
await player.play(); // Resume.
await player.stop(); // 元のスナップショットへ戻す。
await player.close(); // この例の Stop は close() で解放し、次の Play で作り直す。
```

## Node: WAV 出力

Node.js 22 以降。音声デバイスや `audify` は不要です。リポジトリのルートから実行します。

```sh
node examples/snes/02-spc-player/node/main.mjs
node examples/snes/02-spc-player/node/main.mjs output/spc.wav
node examples/snes/02-spc-player/node/main.mjs output/spc.wav /path/to/music.spc 10
```

第1引数は出力 WAV、第2引数は入力 SPC、第3引数は秒数です。既定では同梱音源を 2 秒レンダリングし、`output/snes-02-spc-player.wav` へ保存します。出力は 32,000 Hz のステレオ PCM16 WAV です。

`SpcCore.create({moduleFactory, moduleOptions: {wasmBinary}})` で初期化し、`core.load(bytes)`、`core.renderInto(left, right)` でオフライン処理します。`core.restart()` は読み込んだ元のスナップショットへ戻します。終了時は `core.dispose()` で解放します。

## 時間・レート・制約

内部は固定 **32,000 ステレオフレーム/秒**です。Web では AudioContext の出力レート（例: 44,100 / 48,000 Hz）へ出力側だけでリサンプリングします。Playground の BPM や Worker lookahead は関係しません。Node の WAV はネイティブ 32,000 Hz のままです。

この例は最小限の再生デモです。ID666 / xid6 の曲長・フェード、プレイリスト、自動ループ、DSP 履歴解析は扱いません。SPC 自体に含まれるドライバーのループはそのまま続き、指定の再生上限で停止します。タグがある場合も自動フェードしません。元の SPC のエコー RAM も復元するため、停止後の再開始やファイルによってはクリック等が残る場合があります。

完全な Nintendo IPL ROM は同梱しません。完全な IPL や起動後のホスト転送を必要とする SPC は再生できない場合があります。SPC のレジスター等から復元するため、実機で録音された任意の瞬間の DSP 内部位相を完全再現する保証もありません。

## 同梱音源

`assets/original.spc` はこの例用に作成したデータです。ゲームの音楽・ROM・Nintendo IPL を含みません。CPU は `INC $30; BRA $0200` を繰り返し、音声は 16 サンプルの BRR ループ1ボイスです。

```sh
node examples/snes/02-spc-player/assets/create-original-spc.mjs
```

このコマンドで同じファイルを再生成できます。再生コードは親リポジトリやテスト用モジュールに依存しません。エンジンのライセンスと対応ソースは npm パッケージ内の `licenses/snes-spc/`、`sources/` を参照してください。

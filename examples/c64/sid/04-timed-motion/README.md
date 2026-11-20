# SID：メロディ・波形幅・Filterの別周期制御

公開npm `tetorica-fm2612@0.2.46`だけを使います。本体checkout、ROM、SID曲は不要です。

`npm install` → `npm run dev` → この例のWebを開き、モデルを選んでPlay。
コードは編集して再Playできます。Play前にAudioContextは開きません。

同じSIDに、独立した3つの名前付き予約を置きます。

| 予約 | 周期 | 操作 |
| --- | --- | --- |
| `melody` | 0.6秒 | 0.15秒ごとのE3・G3・A3・B3。各音は0.12秒でGate Off |
| `pulse-motion` | 2秒 | Pulse widthを512・2048・3584・2048へ変更 |
| `filter-motion` | 3秒 | 共有FilterのCutoffを100・700・1200・300へ変更 |

Pulse widthは矩形波の幅（PWM）。SIDにLFOを追加する機能ではなく、
ソフトウェアがハードウェアのパラメーターを予約変更します。メロディが
次の音へ移っても、波形幅とFilterはそれぞれの周期を続けます。

`build()`はコールバックを一度だけ実行して操作を記録します。
`atSeconds()` / `atSample()`は予約開始からの絶対位置、サンプルの基準は
既定44100Hz。出力デバイスのレートやBPMとは独立です。
`setBpm()`はこの例の終了を待つ`beat(8)`の時間だけを変えます。
初期状態は120BPMで約4秒。周期自体を変えるなら`repeatSeconds`と操作の
オフセットを編集します。JSタイマーでレジスタの予約を代行しません。

1つの`captureState()`からPulse width 512／3072を`compile()`して比較し、
メロディ・波形幅・Filterの予測書き込みを表に出します。コンパイルは
live状態もsnapshotも変更しません。snapshotは操作解決用の状態であり、
発振器位相・Envelope進行・C64全体のsave stateではありません。
`current`は確定した音声側の状態を非同期取得します。`client`は取得通信を
せずJS側の既存shadowを使いますが、後の予約や他の書き手を含まない場合が
あります。Nativeでの予約／確定状態取得は未対応です。

両モデルともPAL 985,248Hz・monoです。6581は近似、8580はPreview。
同じホストgain 0.35で、モデル間の音量正規化はしません。Filterは3声で
共有され、CutoffはHzではなくコードです。Gateはハードウェアのままです。
同じGate Onの再書き込みを人工的なOffやEnvelope再トリガーへ置き換えません。

Stopは読み込み中も使え、出力を閉じて予約・クライアント・音源・Contextを
解放します。終了、実行エラー、ページ移動でも同じ後片付けを行います。

Nodeでは次を実行します。

```sh
node examples/c64/sid/04-timed-motion/node/main.mjs
```

両モデルの仮想レジスタ状態を通常の`SidSynth.initialize()`で用意し、
2つのプログラムを同じsnapshotから比較します。packed field・同値Gate
書き込み・時刻と順序を検証します。WASM、AudioContext、音声デバイスは
開きません。任意の第2引数へ検証結果JSONを保存できます。

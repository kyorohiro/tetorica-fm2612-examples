# 操作とレジスタを比較

YM2612のDTとMULTは、同じレジスタの上位／下位ビットを使います。
`setOperator(0, 0, {multi:2})` が、どのDTを残して何byteを書き込むかを比較します。
公開npm **tetorica-fm2612@0.2.41** を使用します。

## Web

`npm install`、`npm run dev` の後、[実行ページ](web/index.html)で
**Inspect register writes** を押します。比較用AudioWorkletの出力Gainは常に0です。
波形・Envelope・CPUの再生状態を復元する例ではありません。

1. JavaScript側とレンダラーにDT3／MULT1を設定します。
2. ソフトウェアの予約でDT5をレンダラーへ書き込みます。JavaScript側のshadowはDT3のままです。
3. 同じ操作を`current`、`client`、`reset`、取得済みsnapshotからコンパイルします。
4. live側をDT7／MULT9へ変更しても、取得済みsnapshotからの比較結果は変わりません。

| 基準 | MULT2を設定した書き込み | 意味 |
| --- | --- | --- |
| `current` | `port 0 / R30 / 0x52` | AudioWorkletで確定したDT5を保持 |
| `client` | `port 0 / R30 / 0x32` | JavaScript側のDT3を保持。状態取得通信なし |
| `reset` | `port 0 / R30 / 0x02` | 初期レジスタのDT0 |
| snapshot A | `port 0 / R30 / 0x52` | 取得時のDT5から同じ操作を比較 |
| snapshot B | `port 0 / R30 / 0x11` | 同じ取得状態からDT1を設定。取得時のMULT1を保持 |

予約のPromiseは「受理」を表します。frameだけでは適用完了と見なさず、
`captureState()`で予約開始frameを越え、R30が予約した`0x51`になったことを
確認してから比較します。個々の書き込みをJavaScriptのtimerで実行しません。

`build()`はcallbackを一度実行して操作だけを記録し、liveの音源やUIを変更しません。
`compile()`も一時状態での変換であり、liveの音源を変更しません。
同じKey Onを2回書く操作は両方残ります。秒／sample指定は予約開始からの絶対オフセットで、
sampleの基準はデバイスと独立した44100 Hzです。

取得済みsnapshotはレジスタと操作解決に必要なlatch等の情報です。
実際の再生中には別の書き込みや所有権保護が割り込むため、コンパイル結果は
実再生の完全な書き込み履歴ではありません。

[Webの全コード](web/main.js)には初期化、比較、表表示、失敗・Cancel・pagehide時の
解放を載せています。コード欄を変えてInspectを押すと、別の操作も比較できます。

## Node — JSONの出力

```sh
node examples/chip-raw/02-compile-compare/node/main.mjs
# output/chip-raw-compile-compare.json
```

末尾に出力先のJSONパスを指定できます。[Nodeの全コード](node/main.mjs)は
音声デバイス・WASM・AudioContextを作りません。これはPCM／WAV出力の例ではありません。

記録専用transportと公開されたstate helperで、既知のローカル状態を保持します。
snapshotのメタデータはローカル比較用に明示しており、AudioWorkletからのcaptureを装いません。
DT3でsnapshotを作った後、clientだけをDT7へ変えるため、結果はWebと次の点が異なります。

- `client`は`0x72`、`reset`は`0x02`。
- snapshot Aは`0x32`、snapshot Bは`0x11`。
- authoritativeな`current`／`captureState()`／予約実行は利用不可として明示的にrejectされます。

同じ公開`compile()`とsnapshot再利用を、独立した基準状態から検証できます。
JSONの`checks`がすべてtrueであることと、実行によって記録専用transportへ追加の
書き込みが送信されないことを確認します。

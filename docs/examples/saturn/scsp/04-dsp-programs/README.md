# SCSP DSP：命令からGain / IIRを作る

`tetorica-fm2612@0.2.44` の公開APIで、自作PCMをDSPへ送り、係数と音の関係を確認します。
0.2.42のpure assemblerと0.2.43のRAM-free executionを、1つの短い例にまとめています。
SaturnのROM・ゲームデータ・SSFや別repositoryは不要です。

## Web

[実行ページ](web/index.html) / [全コード](web/main.js) / [DSP命令](web/programs.js)。
ルートで `npm install` → `npm run dev`。Playを押してMain / Workerを選んで演奏します。
コードはそのまま編集でき、変更は次のPlayから反映されます。40拍で終了し、BPMで長さも変わります。
Stopはロード中も使え、終了・Stopで音声ノードを解放します。

- `assembleScspDsp(source)` はJavaScriptのpureな変換。128 step / 512個の16-bit語を作り、音源やRAMを変更しません。
- `applyDspProgram(words, options)` が所有する音源のDSPへ命令を適用します。Main / Workerの呼び出しは適用後に解決します。
- `setMix(0,{dspSend:7,directLevel:0})` でslot 0をMIXS0へ送り、`setDspReturn({level:7})` でEFREG0を戻します。
- Gainは `input × COEF0 / 4096`。IIRは前の出力をCOEF1、新しい入力をCOEF2で重ねます。
- COEFは符号付きQ12、-4096〜4095。IIRつまみはCOEF1＋COEF2=4096を保ちます。単位はHzではありません。
- 係数の変更で持続音を弾き直さず、TEMP履歴も維持します。Program切り替えも持続音を維持します。

画面下に、適用済みの命令表記、COEFの符号付きコード／レジスタ語／倍率とRAM使用量を表示します。
このprofileは波形RAMへアクセスせず、任意のRAM命令を許可するものではありません。
DSPは各slotで共有。Sourceの説明は固定コアに対応し、SEGA assembler互換や実機のcycle精度の保証ではありません。

## Node

```sh
node examples/saturn/scsp/04-dsp-programs/node/main.mjs ./gain-iir.wav
```

[Nodeコード](node/main.mjs)は同じ自作sawをGain / IIRの順に44.1 kHzでレンダーします。
出力はstereo PCM16 WAV。音声デバイスを開かず、最後に一度だけgain 0.35を掛け、正規化しません。
Program / COEF / Returnの変更とDSP演算によって、元のPCM RAMが変わらないことも確認します。

メモリーを使うエフェクトは次の[managed Delay](../05-dsp-delay/README.md)へ進めます。

# NES DMC サンプル

自作の1-bit DPCM データをメモリーへ送り、再生速度を比較する。
`tetorica-fm2612` 0.2.12 の `NesApuSynth` を使います。標準クロックは NTSC 1789773 Hz。ROM は不要です。

## Web

[ページ](web/index.html) / [コード](web/main.js)。`npm run dev` の一覧から Play を押します。
`createSoundChip('nes', {execution: 'worklet'})` → `NesApuWorkletTransport` → `NesApuSynth` で発音します。
Stop とページ離脱でタイマーを中断し、Transport とチップを解放します。

## Node

```sh
npm install --no-save --package-lock=false audify
node examples/nes/dmc/01-sample/node/main.mjs
```

[コード](node/main.mjs)。`NesApuAudifyTransport` でスピーカーへリアルタイム出力します。
導入手順は [repository README](../../../../README.md#transport-の例) を参照してください。

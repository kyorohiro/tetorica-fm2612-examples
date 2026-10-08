# FDS の波形と変調

64点の波形を作り、変調なし／ありの音色を比較する。
`tetorica-fm2612` 0.2.12 の `NesApuSynth` を使います。標準クロックは NTSC 1789773 Hz。ROM は不要です。

## Web

[ページ](web/index.html) / [コード](web/main.js)。`npm run dev` の一覧から Play を押します。
`createSoundChip('nes', {execution: 'worklet', fds: true})` → `NesApuWorkletTransport` → `NesApuSynth` で発音します。
Stop とページ離脱でタイマーを中断し、Transport とチップを解放します。

## Node

```sh
npm install --no-save --package-lock=false audify
node examples/nes/fds/01-wave-modulation/node/main.mjs
```

[コード](node/main.mjs)。`NesApuAudifyTransport` でスピーカーへリアルタイム出力します。
導入手順は [repository README](../../../../README.md#transport-の例) を参照してください。

# Sega PSG のトーン

10-bit divider と attenuation を書いて矩形波を鳴らす。

チップ生成 → Transport → Synth の基本例です。npm 0.2.6 の API を使います。
導入は [repository README](../../../../README.md#transport-の例) を参照してください。

## Web

[ページ](web/index.html) / [コード](web/main.js)。`npm run dev` の一覧から Play を押します。
`createSoundChip('segapsg', {execution: 'worklet'})` で音源を Worklet 内に作り、Main の `SegaPSGWorkletTransport` から命令を送ります。
演奏ロジックと Synth は Main。利用者がさらに Worker に分けることもできます。

## Node

```sh
npm install --no-save --package-lock=false audify
node examples/genesis/psg/01-tone/node/main.mjs
```

[コード](node/main.mjs)。`createSoundChip('segapsg')` と `SegaPSGAudifyTransport(chip)` で発音します。
音源と Synth は呼び出し元のスレッドに置き、音声デバイスの管理だけを内部 Worker に隔離します。
この例は WAV 保存ではなくスピーカー再生です。macOS / CoreAudio で検証します。

DirectTransport による PCM 生成・再生・WAV 保存は [専用例](../../../transport/direct/01-single-note/README.md) を参照してください。

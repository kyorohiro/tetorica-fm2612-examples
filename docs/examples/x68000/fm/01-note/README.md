# X68000 YM2151 の FM 発音

YM2151Synth と FM_PRESETS.sine を使い、A4 を1つのオペレーターで発音します。標準クロックは3579545 Hzです。

チップ生成 → Transport → Synth の基本例です。npm 0.2.11 の API を使います。
導入は [repository README](../../../../README.md#transport-の例) を参照してください。

## Web

[ページ](web/index.html) / [コード](web/main.js)。`npm run dev` の一覧から Play を押します。
`createSoundChip('ym2151', {execution: 'worklet'})` で音源を Worklet 内に作り、Main の `YM2151WorkletTransport` から命令を送ります。
演奏ロジックと Synth は Main。利用者がさらに Worker に分けることもできます。

## Node

```sh
npm install --no-save --package-lock=false audify
node examples/x68000/fm/01-note/node/main.mjs
```

[コード](node/main.mjs)。`createSoundChip('ym2151')` と `YM2151AudifyTransport(chip)` で発音します。
音源と Synth は呼び出し元のスレッドに置き、音声デバイスの管理だけを内部 Worker に隔離します。
この例は WAV 保存ではなくスピーカー再生です。macOS / CoreAudio で検証します。

DirectTransport による PCM 生成・再生・WAV 保存は [専用例](../../../transport/direct/01-single-note/README.md) を参照してください。

## YM2151Synth

`YM2151Synth({transport})` と `FM_PRESETS.sine` を使い、`noteOn(0, 'A4')` / `noteOff(0)` で発音します。Web は `YM2151WorkletTransport`、Node は `YM2151AudifyTransport` を注入し、同じ Synth 操作を使います。8チャンネルと論理順 M1 / M2 / C1 / C2 の4オペレーターに対応します。

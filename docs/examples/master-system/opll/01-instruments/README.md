# Master System：OPLLのROM音色と共有User Patch

`tetorica-fm2612@0.2.23` の `YM2413Synth` で、内蔵Violin／Piano／Flute／Organを同じA4で比較します。
続いてinstrument 0を選んだ2CHを同時に鳴らし、チップ全体で1つのuser patchをsineからbellへ変更します。
同時に鳴るCH2の内蔵Fluteは、その変更の影響を受けません。Sega PSGの短い低音伴奏でMaster Systemの2音源構成も示します。

## Web

[ページ](web/index.html) / [全コード](web/main.js)。repositoryルートで `npm install` → `npm run dev` を実行し、一覧から開きます。
HTTPSまたはlocalhostと、AudioWorklet対応ブラウザーが必要です。

YM2413は `createSoundChip('ym2413', {execution:'worklet', audioContext})` → `YM2413WorkletTransport` → `YM2413Synth`、
Sega PSGは `createSoundChip('segapsg', …)` → `SegaPSGWorkletTransport` → `SegaPSGSynth` と接続します。
2つのWorkletが同じAudioContextへ出力し、PCMの時間はWorklet内で進みます。
編集欄では `opll`、`OPLL_INSTRUMENTS`、`OPLL_USER_PRESETS`、`psg`、`sleep(秒)`、`console` を使えます。
このOPLL定数名は、このページがモジュールの `YM2413_INSTRUMENTS`／`YM2413_USER_PRESETS` に付けた別名です。

ページを開くだけではAudioContextを作りません。演奏は有限で、終了・Stop時は両方のWorkletとAudioContextを解放します。
読み込み中のStopにも対応し、編集内容は次のPlayで実行します。

## Node

```sh
node examples/master-system/opll/01-instruments/node/main.mjs
node examples/master-system/opll/01-instruments/node/main.mjs ./opll-instruments.wav
```

[全コード](node/main.mjs)。Node.js 22以降を使います。
`YM2413DirectTransport` と `SegaPSGDirectTransport` で2つのチップを操作し、`ChipPCMRenderer` で両方を44,100 Hzへ揃えて混ぜます。
累積フレーム数で時間を丸めるため、音符ごとの端数が失われません。音声デバイス・AudioContext・audifyは不要です。
出力先を省略すると `output/master-system-opll-01-instruments.wav` に保存します。

## APIの要点

- CH番号は0始まり、A4 = MIDI 69 = 440 Hzです。YM2413のクロックは3,579,545 Hz。
- `setVoice(ch, {instrument, attenuation})` のinstrument 1〜15が内蔵音色、0が共有user patchです。
- `setUserPatch()`／`setUserOperator()` は、instrument 0を選んだすべてのCHへ同時に反映されます。
- キャリアの音量はCHごとのattenuationで設定します。user operatorのTLはモジュレーターのみです。
- attenuationは0が最大、15が最小。例では両音源の出力gainも下げ、同じmono音声を左右へ出しています。
- ROM音色はチップ実装の内蔵音色を選ぶだけです。外部ROM・音声サンプルを読み込みません。

[repository README](../../../../README.md) / [package API一覧](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/packages/fm2612#api-entry-points)

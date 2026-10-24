# Calibrated Mixer：音源間の音量を比較

`tetorica-fm2612@0.2.27` の公開APIで、通常の初期値と任意の実測プリセットを聴き比べるブラウザー用の例です。
[Web ページ](web/index.html) と [全コード](web/main.js) を参照してください。

Play前に **Calibrated preset** または **Legacy defaults** を選びます。
YM2612 FM、Sega PSG、AY-3-8910、NES pulse が、440 Hzで1つずつ約1.2秒鳴ります。
約6秒で終了し、Stopで途中終了できます。再生中は初期値の選択を固定しています。

```javascript
import {createSoundChip, SoundChipMixer, SOUNDCHIP_MIXER_PRESETS} from 'tetorica-fm2612';

const mixer = new SoundChipMixer(SOUNDCHIP_MIXER_PRESETS.calibrated);
const chip = await createSoundChip('segapsg', {
  execution: 'worklet', mixer, audioContext, outputNode: master, gain: 1, signal,
});
// new SoundChipMixer() なら従来の初期値です。
```

| 音源 | Legacy | Calibrated |
| --- | ---: | ---: |
| YM2612 FM | 100% | 77.5938% |
| Sega PSG | 100% | 45.5420% |
| AY-3-8910 | 100% | 110.0331% |
| NES | 100% | 151.4209% |

画面の表は接続中の `mixer.get(chip.id).volume` を線形倍率で表示します。接続前は `mixer.getKindDefault(kind)` の値です。
4つのChipは同じAudioContextとMaster GainNode（30%）を共有し、各Chipの出力Gainは1にしています。
表示する倍率はChipごとのMixer設定であり、共有Masterの30%は含みません。

FMは `FM_PRESETS['one-op-basic']` を元に、唯一のキャリア（OP4）を減衰しない最大レベルへ変更した正弦波です。
Sega PSGとAYは最大固定音量の矩形波、NESは最大固定音量・50% dutyのPulseです。
音源の周期レジスターの量子化により、実際の周波数は440 Hzに近い値になります。

Calibratedは決まった基準音から求めた固定の初期値です。自動正規化ではなく、音色や同時発音数による音量差は残ります。
OPN内部のFM・SSGの比率やDirect実行の生PCMは変更しません。
`mixer.set(chip.id, {volume: 0.5})` などの個別指定は、この初期値への乗算ではなく絶対値です。

Stop・正常終了・エラー時には発音を止め、各Transport・Chip・共有AudioContextを解放します。
Stop中のロードもAbortSignalで中断します。この例にNode版はありません。

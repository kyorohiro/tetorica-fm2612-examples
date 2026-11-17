# SCSP DSP：RAMを使うDelay

`tetorica-fm2612@0.2.44` の `setDspDelay()` で、既存の6-step DSP Delayを使います。
Web AudioのDelayNodeでなく、SCSPコア内のDSPがpacked形式のRAM ringを読み書きします。
自作PCMだけで試せます。ROM・ゲームデータ・SSF・68000は不要です。

## Web

[実行ページ](web/index.html) / [全コード](web/main.js)。ルートで `npm install` → `npm run dev`。
Main / Workerを選び、Playで初めて音声を開始します。コードも編集できます。
Releaseで入力音だけを離鍵し、Echoが残ることを確認してください。Retriggerで同じA3を弾き直せます。
表示されるProgram / COEF / RAMは、音源が適用を確認した設定です。

```js
await saturn.setDspDelay({enabled:true,timeMs:240,feedback:0.35});
await saturn.setMix(0,{directLevel:0,dspSend:7});
await saturn.setDspReturn({level:7,pan:0});
const setup = await saturn.getDspProgram();
```

- Timeは整数20〜700 ms。Feedbackは-1〜4095/4096で、符号付きQ12へfloor量子化されます。
- Sendはslot単位、Returnは1つの共有EFREG0。値は0〜7のハードウェアレベルです。
- COEF1がFeedback。連続操作は `setDspCoefficients({1:code})` の小さな差分を送り、`delay.feedback`表示も同期します。
- Time / Enable変更はringを消去し、Feedback / Return変更は履歴を保ちます。
- noteOffはEchoを残します。同じinstanceの`stopVoices()`／Code Stopは音と残響を消去してsetupを保持します。このページのStopはsessionを終了するため、次のPlayで新しいinstanceを作ります。

最初の成功時だけ64 KiB ringを8 KiB境界へ確保します。alignment gapもRAM使用量に含みます。
読み込んだPCMを移動・破壊せず、RAM不足や不正設定は前の音を保持して拒否します。
`getState().dspRam`は予約、`getDspProgram()`の`delay-ring` profileは`delay`と`ram`を示します。
resetはDSP設定をクリアして予約を保持し、`reset({clearRam:true})`はbankと予約を解放します。
Gain / IIRへ切り替えても予約は保持します。任意RAM配置・任意RAMプログラムの実行APIではありません。

## Node

```sh
node examples/saturn/scsp/05-dsp-delay/node/main.mjs ./delay.wav
```

[Nodeコード](node/main.mjs)は50 msだけ入力し、離鍵後のEchoを1秒、Stop後の無音を100 msレンダーします。
44.1 kHz stereo PCM16 WAVで、最後に一度だけgain 0.35を掛け、正規化しません。
元PCMが変わっていないことを検証し、DSP命令・COEF・RAMの設定もログへ出します。
音声デバイスは開きません。

WebのMain / Workerは同じ音声ownerへ操作を送ります。現在のNative DSP transportは明示的に
`NotSupportedError`となります。実コアは実験的なMAME由来の実装で、実機精度の保証ではありません。
読みやすいJS、型、coreのライセンスと対応ソースはvendor/npm配布物内に保持します。

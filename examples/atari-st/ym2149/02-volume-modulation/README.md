# YM2149：固定Volumeレジスタのソフトウェア変調

公開npm `tetorica-fm2612@0.2.41` の時刻付き操作APIを使うWeb専用例です。Atari ST相当の2 MHz、YM2149の`type:0x10`、`flags:1`でエンドポイントを作ります。元のゲーム曲やPCMデータは使いません。

Webを開いてPlayを押すと、8拍のメロディを再生しながら、CH1（APIでは0）のR8固定Volumeを別の周期で変えます。コード欄の変更は次のPlayに反映します。読み込み途中のStop、プログラム失敗、pagehideでもエンドポイントとAudioContextを解放します。

## Volumeパターン

固定Volumeは0〜15の16段階です。0が無音、15が最大です。コード値は等間隔のPCM振幅ではなく、音源固有の非線形レベルです。音量変化のパターンと予約はソフトウェアの処理です。Toneの生成とVolume段階の音色はチップ側の処理です。ハードウェア共有Envelopeは`envelope:false`で無効にしています。

初期の16個の`levels`を50回/秒で繰り返し、800書き込み/秒をAudioWorkletへ予約します。JavaScriptは各レジスタ書き込みをタイマーで送信せず、1つのコンパクトな繰り返し予約を渡します。`modulationHz`はHz、`setBpm()`と`beat()`はメロディの拍です。BPMを変えても、明示したHzは変わりません。

`setNote()`はToneの音程だけを変えます。メロディ内で`noteOff()`を送っても次の予約R8書き込みで音量が復帰するので、この例では各音の間にKey Offしません。終了時は`clearSchedule("volume-modulation")`で未来の書き込みを止め、`keyOff(0)`で最後のレベルを無音にします。ホストのStopも同じ予約を取り消して全CHを無音にし、音声リソースを解放します。

## 書き込みを確認する

`build()`は操作と絶対オフセットを記録するだけで、ライブ状態を変更しません。`atSeconds(index / (modulationHz * levels.length))`は予約開始からのオフセットで、前のイベントからの累積時間ではありません。

`compile(...,{initialState:"client"})`はローカルのレジスタ／保持レベルを作業用にコピーして予測します。表のR8書き込みは予約パターンそのものを示し、別の操作が割り込んだときの全実行履歴とは異なります。`schedule()`のPromiseは受付完了で、パターンの再生完了ではありません。同じ名前への再予約は位相を再開始します。

`levels`を変えて段数や形を試せます。次に`modulationHz`、`notes`、`setBpm()`を変え、音量と音程の周期を別々に聴いてください。Toneを`false`、Noiseを`false`にすると、音量レジスタの動きだけを出力する実験にもできます。

この例は汎用PCM変換器や実機MFPタイマーの再現ではありません。Native timed実行は今回の公開APIで未対応なので、Nodeのタイマーへ置き換える例は追加していません。

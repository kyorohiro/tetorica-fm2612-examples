# SID共通factoryの最小例（2026-11-11）

ユーザー承認: 公開予定`tetorica-fm2612@0.2.39`の共通`createSoundChip('sid')`で6581／8580を選び、音色設定・発音・PCM生成・WAV保存を試せる小さな使用例を追加する。

- [x] Node専用の短い自立した例を追加する。音声デバイス、C64 CPU、ROM、SID曲を使わない。
- [x] 一覧・README・実行コマンドと、両modelの周波数・持続音・Release・WAV形式を確認する検証を追加する。
- [x] 親で検証・公開する0.2.39のtarball／公開npmから依存を入れ、無音で確認する。
- [x] dependency／lockを公開versionへ揃え、静的サイトを再生成して記録する。

境界: 共通factoryは既存low-level coreを返す。発音には既存`SidSynth({core})`を使う。演奏helper、Preset一括適用、Round robin、Legato、Looper／Event Recは追加しない。commit／pushとPages公開は行わない。

## 公開予定tarballの検証

- 親repositoryの検証済み`tetorica-fm2612-0.2.39.tgz`を`--no-save --package-lock=false`でinstallし、dependency／lockは公開確認まで変更していない。
- `npm run check:node -- --only=sid`で3例×2modelの6実行が成功。新例は各36,000frames（0.75秒）、A4は両modelとも440.03 Hz。持続AC信号、左右同一のstereo PCM16、Release後の減衰を確認した。
- 既定の`both`は72,000frames（1.5秒）で、6581→8580を個別に生成したPCMの連結とbyte一致する。
- 全offline Node suiteの50実行も成功。manifestの`nodeAudioOutput`対象を除外し、音声デバイスを開かずWAV／event JSONを検証した。
- candidateで`npm run build`成功。Node専用catalogのentryと新しいREADME／sourceが静的出力へ反映され、vendor packageは0.2.39だった。
- 0.2.39の共通factoryに必要な`sid_soundchip.js/.d.ts`をruntimeコピーの検証に追加した。sourceのREADME／runtime案内も共通factoryと既存専用APIの使い分けへ更新した。

一時ログ: `/private/tmp/sid-factory-examples-candidate-sid-20261111.log`、`/private/tmp/sid-factory-examples-candidate-all-node-20261111.log`、`/private/tmp/sid-factory-examples-candidate-build-20261111.log`。実聴はしていない。

## 公開npmによる最終確認

親側で`tetorica-fm2612@0.2.39`の公開とregistryから再取得したtarballの全byte一致を確認後、公開registryからexact dependencyをinstallした。package.json／lockのversionは0.2.39、lockのresolvedはregistryの0.2.39 tarballで、local file指定を残していない。

- 公開tarball／検証済みcandidate SHA256: `fb82ffb75f40907e44a9e3672c83796a779a88e09a2a597f306b734da05db874`。
- `npm run build`／`npm run build:docs`成功。catalogは76件。新例はNode専用でWebへの不存在リンクを出さない。
- `dist`／`docs`両方で、vendorの全1,251filesがinstall済み公開packageとbyte一致。新しいREADME／Node source、manifest、index／runtime guideも正本と一致。
- 公開packageからSIDの6model実行と既定bothを再確認し成功。50offline実行時のcandidateと公開tarballは同一である。
- 現在版のREADME／静的見出しを0.2.39へ更新した。過去のAPI追加履歴はその版番号のまま保持した。

恒久記録: [SID_FACTORY_VERIFICATION_20261111.json](SID_FACTORY_VERIFICATION_20261111.json)。最終ログは`/private/tmp/sid-factory-examples-registry-build-20261111.log`、`/private/tmp/sid-factory-examples-registry-build-docs-20261111.log`、`/private/tmp/sid-factory-examples-registry-sid-20261111.log`。commit／push／Pages公開はしていない。

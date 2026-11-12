# Original VAB fixture

`demo.vab` is the original synthetic `spu-synth-demo.vab` from Tetorica's [SPU import demos](https://github.com/kyorohiro/hello_ymfm_wasm/tree/main/docs/playground/samples/spu-import). It contains Program 3 / Tone 0 and 1, plus sparse Program 11 / Tone 0, with looping and one-shot ADPCM. There is no game code, game sample or external recording. Data and generator are BSD-3-Clause; see LICENSE.

The [original generator](https://github.com/kyorohiro/hello_ymfm_wasm/blob/main/scripts/build_spu_import_demos.mjs) uses the self-authored fixture in [test/helpers/spu_vab_fixture.mjs](https://github.com/kyorohiro/hello_ymfm_wasm/blob/main/test/helpers/spu_vab_fixture.mjs). This copy preserves the standard VAB bytes; no JSON conversion or re-encoding is involved.

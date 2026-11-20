# ASWAN timed API examples — 2026-11-20

Updated exact public npm dependency from 0.2.44 to **0.2.45**, with official
registry URL and SHA512 in the lockfile. Private examples package remains 0.1.0.
Clean `npm ci --ignore-scripts --no-audit --no-fund` succeeds.

New lesson: `wonderswan/registers/01-timed-operations`, using only published npm
subpaths. The Web page has editable code, compile trace, two-plan/same-snapshot
comparison and one compact pan/Gate reservation. A later manual silent CH2 Gate
survives the actual shared R90 Noise-mode update. This is a forecast comparison,
not a claim to display the actual runtime write history. A Node-only pure
compiler lesson verifies immutable baseline reuse, packed pan values, shared
Gate retention, repeated R8E reset writes and mixed-unit same-time ordering.
No Node device, WASM or AudioContext is opened by that Node lesson.

## Try it

```sh
npm ci
npm run dev
```

Choose **ASWAN：操作・レジスタ・予約演奏** in the catalog. It is at
`/examples/wonderswan/registers/01-timed-operations/web/index.html`.
Edit the code and Play again. `setBpm()` affects musical waits; second/reference
sample offsets remain independent. Startup has no audio context until Play.
`Stop` closes the context and endpoint, including when WASM is still loading.

```sh
npm run check:wonderswan-timed -- --sample-rate=44100
npm run check:wonderswan-timed -- --sample-rate=48000
npm run check:node
npm run check:wonderswan
npm run check:scsp-dsp
npm run build
npm run build:docs
```

## Verification

- All **55** offline Node examples pass, including the new compiler comparison.
- Timed browser examples: **24** cases pass (Chromium/WebKit × 44.1/48 kHz ×
  YM2149 buzzer, YM2149 volume, YM2612 ymfm/Nuked, ASWAN, register comparison).
- Additional ASWAN checks pass all **four** browser/rate cases, observing the
  actual Noise-mode write and preserving the intervening manual Gate. They also
  cover 390px page width, source edits/replay, natural completion, Stop and
  pending-WASM cancellation. Final docs additionally pass both browsers at 48kHz.
- Existing WonderSwan Wave/Noise/Voice PCM: **six** browser cases pass.
- Existing SCSP DSP Gain/IIR/Delay: Node numeric checks and **16** browser/rate/
  Main-or-Worker cases pass. These are regression checks; no new SCSP lesson.
- All automated browser destinations are behind zero gain before routing/startup.
  Actual upstream PCM is measured for nonzero finite AC and no clipping. There
  are no page errors or missing assets. Human listening is separate.
- `dist` and `docs` have **1,655 identical files**, including all **1,328**
  installed official npm payload files unchanged. All **84** catalog entries
  resolve and authored example sources are copied byte-for-byte, without
  minification. Package/runtime source validation remains enabled.

The browser runner previously pinned historical 0.2.41 and now checks 0.2.45.
ASWAN checks stop sampling once the target register transition is observed,
rather than sending captures after this short lesson has naturally ended.
`--case=wonderswanTimed` limits checks to this lesson when desired.

Machine evidence: [browser verification](aswan-timed-browser-verification-20261120.json),
[distribution verification](aswan-timed-distribution-20261120.json). Screenshots
and working logs remain under `/tmp/aswan-examples-*`.

## Scope

Scheduling is software-controlled; raw Gate operations are hardware register
operations and have no Synth software Release. Public recorded noteOn/noteOff,
Wave RAM transfer, Voice PCM feeding and Native scheduling remain out of scope.
The new lesson uses Main; existing SCSP regressions cover Main/Worker, and the
parent public-runtime checks separately cover WonderSwan Worker scheduling.

No parent runtime changes, game assets, SDK rebuild, npm publication, Tauri
import, commit/push/tag or Pages deployment performed by this task. Generated
`docs` is ready for review and a later push.

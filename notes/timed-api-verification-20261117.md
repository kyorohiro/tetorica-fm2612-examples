# Published timed API examples — 2026-11-17

The examples consume exact published `tetorica-fm2612@0.2.41` (previously
0.2.40). All four contain their complete readable source, editable Web code,
relative npm import maps and Japanese usage notes. No parent runtime imports,
shared example framework, minifier or external game assets were added.

| Example | Environment | What to change |
| --- | --- | --- |
| `atari-st/ym2149/01-sync-buzzer` | Web | R13 retrigger frequency, shared hardware Envelope, melody BPM |
| `atari-st/ym2149/02-volume-modulation` | Web | 16 nonlinear volume codes, R8 write frequency, independent note pitch |
| `genesis/fm/07-timed-operators` | Web, ymfm / Nuked | TL / MULT pattern period independently of melody BPM |
| `chip-raw/02-compile-compare` | Web / Node JSON | Current / client / reset / reusable snapshot register traces |

## Try / reproduce

From this repository:

```sh
npm ci
npm run dev
```

Open the catalog at http://127.0.0.1:5173. Select the Web example, edit its
code, then Play (or Inspect register writes for comparison).
Changing `setBpm()` changes musical waits; scheduled Hz / seconds remain
independent. No AudioContext is created just by opening these pages.

```sh
npm run build
npm run build:docs
npm run check:timed -- --sample-rate=48000
npm run check:timed -- --sample-rate=44100
npm run check:node
node scripts/check-msx-browser.mjs --case=envelope
npm run check:vab
node examples/chip-raw/02-compile-compare/node/main.mjs ./register-comparison.json
```

`check:timed` requires Playwright Chromium / WebKit. Every physical destination
is permanently muted before the page runs; real PCM is measured upstream.
Node checks do not open an audio device. Native timed playback is unsupported;
the Node comparison deliberately uses a known local baseline and JSON output,
not a timer fallback or a pretend AudioWorklet capture.

## Verified

Detailed machine evidence: [timed-api-verification-20261117.json](timed-api-verification-20261117.json).

- 20 new browser cases: both browsers at 44.1 / 48 kHz, including both YM2612
  engines. Confirmed actual moving R8 / TL / MULT, repeated R13, compact repeat
  patterns, generated trace tables, edited-code replay, unchanged repeat period
  after changing BPM, natural finish, Stop and cancellation during WASM loading.
- Current / client / reset / snapshot first R30 values are respectively
  `0x52` / `0x32` / `0x02` / `0x52`. A second program from the same snapshot
  produces `0x11`. Snapshot and live state remain unchanged during compilation;
  duplicate Key On writes remain present.
- The comparison waits for both the accepted frame and the observed scheduled
  register value before using current state. This fixes an initialization race
  exposed under WebKit in the full run. Acceptance alone is not completion.
- 52 installed-package offline Node cases passed, including register JSON,
  existing PCM / WAV / event checks. Three additional VAB selection checks
  retained tuning and produced exact raw VAB / PCM round trips; invalid inputs
  and input clobbering were rejected.
- Existing AY Envelope and VAB browser checks passed in both browsers. The AY
  checker's former direct destination connection was corrected to permanent
  gain zero; its upstream PCM assertions remain intact.
- YM2149 type `0x10`, clock 2 MHz, flags 1: 32 envelope levels and Period 100's
  12.8 ms / 78.125 Hz cycle confirmed from local core source and CPU-only WASM.
- Four pages fit a 390 px viewport without document-level horizontal overflow;
  screenshots were inspected for the editor and comparison layout.
- `dist` and `docs`: all 1,589 files / 12,703,048 bytes match exactly. Each
  vendor contains all 1,275 installed npm files / 11,636,124 bytes unchanged,
  including JS, types, WASM, license notices and third-party source material.
- New source trees match their generated copies. Source links and import maps
  resolve within an isolated static-site subpath without parent repository
  fallback. Build integrity checks remain enabled.

## Scope / restart

No listening test, commit, push, Pages deployment, Tauri import, new npm
publication or C++ / WASM / SDK rebuild was performed. The generated vendor
delta is the published 0.2.40 → 0.2.41 package update, not local runtime edits.
The parent repository contains coordination / verification records only.

Next review the changes in this separate repository, optionally listen to the
four examples, then commit / push when requested. `docs/` is ready for the
existing Pages publishing workflow. The root package itself is already 0.2.41;
these examples require no further package publication.

# Published DMG / SID timed examples — 2026-11-21

This repository now consumes exact published `tetorica-fm2612@0.2.46`
(previously 0.2.45). It retains every existing catalog entry and adds two
editable, self-contained lessons. No parent checkout runtime imports,
minification, external game files or shared lesson framework were added.

| Lesson | What it demonstrates |
| --- | --- |
| `gameboy/registers/01-timed-operations` | Pulse, Wave and Noise reservations with independent 0.5 / 0.75 / 0.25 second periods; Wave DAC stop, RAM transfer, then retrigger |
| `c64/sid/04-timed-motion` | Actual 6581 / 8580 clients; a fast melody, Pulse width and shared Filter with independent 0.6 / 2 / 3 second periods |

Both Web pages compare `compile()` results from one reusable `captureState()`
snapshot, show a labelled register table, and expose the full host source.
Node counterparts compare structured writes without WASM or an audio device.

## Try locally

```sh
npm ci
npm run dev
```

Open the catalog at http://127.0.0.1:5173, or use these paths:

- `/examples/gameboy/registers/01-timed-operations/web/index.html`
- `/examples/c64/sid/04-timed-motion/web/index.html`

Edit the code, then Play. SID model selection is available while stopped.
The default program lasts about four seconds. `setBpm()` changes ordinary
`beat()` waits; explicit reservation seconds and reference samples remain
independent. To change a reservation's speed, edit its offsets and
`repeatSeconds`. Stop also works during initialization.

## Verification

Machine-readable evidence:
[dmg-sid-timed-verification-20261121.json](dmg-sid-timed-verification-20261121.json).

- All 57 installed-package Node cases passed, including the two new JSON
  comparisons. Existing audio checks render WAV files offline and never open
  a physical audio device.
- Twelve new browser cases passed (18 initial model runs): 48 kHz on both
  dist/docs with Chromium/WebKit, plus 44.1 kHz on dist with both browsers.
  Every SID case covers 6581 and 8580. Real nonzero AC PCM was measured before
  a permanently zero-gain physical destination; no listening was performed.
- Actual register changes, three compact independent reservations, snapshot
  reuse, labelled traces, edited-code replay, natural finish, Stop during
  pending WASM initialization, runtime/syntax failures and restart passed.
  Syntax errors create no AudioContext; all created contexts finish closed.
- The 12 existing timed browser cases also passed at 48 kHz: both browsers,
  ST buzzer/volume, YM2612 ymfm/Nuked, ASWAN and raw register comparison.
- Source links and 55 served files matched authored/public source or exact
  installed npm bytes. Pages work beneath an isolated static-site subpath
  without parent-repository fallback or external network dependencies.
- Both new pages fit a 390 px viewport without page-level overflow. Desktop
  and narrow screenshots were inspected for readable controls, code and traces.
- All 1,713 site files / 13,396,339 bytes match between dist and docs. Each
  vendor preserves all 1,378 installed npm files / 12,231,444 bytes unchanged,
  including JavaScript, types, WASM, licenses and third-party source material.
  The catalog now has 86 entries. New lesson source matches both generated trees.

Reproduce focused checks after building:

```sh
npm run check:node
npm run build
npm run build:docs
npm run check:dmg-sid:browser -- --sites=dist,docs --sample-rate=48000
npm run check:dmg-sid:browser -- --site=dist --sample-rate=44100
npm run check:timed -- --sample-rate=48000
```

The browser checks require Playwright Chromium and WebKit. They mute every
physical output before audio starts. Individual Node comparison commands are
listed in each lesson README; an optional output path writes JSON.

## Limits and next handoff

Reservations are software scheduling of chip register operations, executed on
the AudioWorklet sample clock. `atSample()` defaults to a 44100 Hz reference
independent of output device rate. Snapshots preserve operation-resolution
state, not oscillator phase, Envelope progress or complete machine state.
`compile()` predicts writes against its selected baseline, rather than logging
intervening live writers. Client-shadow state may be older than renderer state.

Raw SID Gate and DMG Wave DAC behavior are retained without artificial
retrigger/fades. Both SID models use the same host gain; 6581 is an
approximation and 8580 is Preview. Native timed execution/current capture is
unsupported, with no JavaScript timer fallback. Stop closes owned audio and
disposes late endpoints; it does not promise cancellation of the DMG helper's
underlying network fetch.

Changes are local in this separate examples repository. No commit, push,
Pages deployment, Tauri update or additional npm publication was performed.
The parent runtime repository remains unchanged. Optional next step: listen to
the two lessons, then review/commit/push the examples repository when requested.

# SCSP DSP examples — 2026-11-18

The examples repository previously used npm 0.2.41 and had PCM, LFO and
sound-stack modulation lessons. The current update adds the public 0.2.42
assembler, 0.2.43 RAM-free execution and 0.2.44 managed Delay in two small lessons:

- `saturn/scsp/04-dsp-programs`: readable instruction source, assembly /
  disassembly, Gain / IIR, held-note coefficients and offline WAV comparison.
- `saturn/scsp/05-dsp-delay`: managed 64 KiB ring, release tail, quantized
  Feedback, Time / Enable clear, acknowledged program / COEF / RAM inspection.

Both browser lessons have explicit Play / Stop, editable complete scripts and
Main / Worker selection. Code uses beats; 40 held beats plus two release beats
complete the audition. Page Stop closes its session; the underlying instance's
`stopVoices()` retains DSP setup, as documented separately. Continuous Feedback
changes use small COEF1 deltas. Original PCM is not normalized or overwritten.

## Candidate verification

The parent validated `tetorica-fm2612-0.2.44.tgz` was temporarily installed with
`--no-save --package-lock=false`. Package.json targets exact 0.2.44; the old
lockfile is intentionally pending official-registry installation at this stage.
The examples package itself remains private version 0.1.0.

- New Node WAV checks pass: significant Gain / IIR waveform difference, complete
  44.1 kHz mono-in-stereo PCM16, PCM RAM unchanged, delayed wet onset, release
  echoes, second echo near half amplitude and exact Stop silence.
- All 54 offline Node examples pass, including existing timed register JSON.
  That JSON now reports the actual installed version instead of a fixed 0.2.41.
- Existing SCSP browser checks pass all 12 lesson / browser / execution cases,
  raw offline PCM proofs and the three existing Node WAV examples.
- New browser checks pass 16 cases: Chromium / WebKit × 44.1 / 48 kHz ×
  Main / Worker × Gain-IIR / Delay. Real wet output, held PCM, live coefficient
  updates, release tail, Time clear, Stop / natural cleanup, editable code,
  390px layout and a non-root URL prefix are verified. Physical output remains
  behind a gain fixed at zero. Missing assets, external fallback and page errors
  are absent. No listening or Node audio-device output is performed.

## Published-package finalization

The parent published and verified npm 0.2.44. `npm install --save-exact tetorica-fm2612@0.2.44` was followed by a clean `npm ci --ignore-scripts` from
that lockfile. The examples package remains private version 0.1.0.

The lockfile uses the public registry URL and exact registry SHA512 integrity:
`sha512-wOua7x33rGkNmY2PcPO5oN6xNd6r6O0dc/q+HdyjcW2nwIEx9N41OsujNTE/6AXodZw4RgicPnP3b77iGNR15A==`.
No local tarball or parent-repository path remains in dependency metadata.

Both `npm run build` and `npm run build:docs` pass. Every one of the 1,299
installed / dist-vendor / docs-vendor files matches the official registry tarball.
The complete 1,622-file dist and docs sites are byte-identical, every example
source is copied unchanged, all 83 catalog items point to existing targets,
and the exact browser-tested asset bytes match the final docs site. Parent
independent verification reached the same registry / vendor result.

The official clean installation passes the new offline Node checks again. All
16 new browser cases and the 12 existing browser cases apply to these identical
published runtime / application bytes; no heavier browser repetition was needed.

[Machine verification](scsp-dsp-verification-20261118.json) and
[distribution audit](scsp-dsp-distribution-20261118.json) retain evidence and hashes.
No git commit, push or Pages deployment was performed.

## Commit / push follow-up — 2026-11-18

The user later approved committing and pushing this completed examples update.
The preceding no-push record describes the preparation checkpoint. This
follow-up reviews the unchanged verified source / vendor payload and dependency
lock before a normal push to `origin/main`; final Git identity and remote
equality are recorded by the parent task. No Pages setting or manual deployment
command is changed.

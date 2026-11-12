# VAB API example / npm 0.2.40 (2026-11-12)

- [x] Pin the published `tetorica-fm2612@0.2.40`, its registry integrity and lockfile.
- [x] Add `examples/ps1/spu/03-vab-bank` with one original standard VAB fixture, a browser Program/Tone picker and explicit preview, and a CPU-only Node WAV renderer.
- [x] Export the selected original Tone as a standard `.vab`; preserve source tuning, ADSR, loop and sample bytes without an intermediate JSON preset.
- [x] Connect the example to the catalog, source links, README and Node/browser validation. Explain source-preserving export limits and shared effects separately.
- [x] Verify all Node examples, the new VAB paths/round trips, silent Chromium/WebKit, and identical complete `dist` / `docs` builds from the registry package.
- [x] Save verification evidence and final TODO status. Do not commit, push, publish Pages/npm/itch, update other apps or rebuild WASM.

Do not open ordinary browsers/native apps or change OS volume. Offline renders write files only; browser tests intercept every physical destination at gain zero before app startup and Chromium also uses `--mute-audio`. Runtime JS/CSS and examples remain readable. No game audio, ROMs or third-party VAB banks are included. Parent task: `docs/issues/todo_ps1_vab_examples_01.md` in `hello_ymfm_wasm`.

Completed: [verification record](vab-api-verification-01.json). Published0.2.40 is pinned;51 offlineNode cases and3 VAB Tones pass. Chromium/WebKit pass the newexample and4 existingSPU browsercases with output muted. All1,554dist/docs files match, including all1,253 npm files. No commit/push or Pages/npm/itch/Tauri publication was performed.

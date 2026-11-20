# DMG / SID timed examples — 2026-11-21

User authorized updating this examples repository after npm 0.2.46 publication.
Keep examples based on the published package; do not import the parent checkout.
No commit, push, Pages publication or npm publication is requested here.

- [x] Pin tetorica-fm2612 0.2.46 in package.json / lock and install it.
- [x] Add a DMG timed lesson for Pulse / Wave / Noise, with readable source,
      hardware semantics, compact sample-clock reservations and cancel/Stop.
- [x] Add a SID lesson with faster melody and independent waveform/modulation
      and shared Filter periods; support 6581 and 8580 with correct ownership.
- [x] Include compile/current/reused snapshot inspection and Node examples
      that compare structured register writes without physical audio output.
- [x] Register lessons in the manifest and README, retain existing examples,
      update runtime capability checks and build the usual distributable tree.
- [x] Verify Node examples, actual published modules and both-browser web
      behavior, nonzero PCM, period independence, stop/cleanup, failures and
      source visibility. Permanently mute physical outputs before audio starts.
- [x] Record verification, entry paths, commands and backend limitations.

Timed offsets are absolute seconds/reference samples (44100 default), not BPM.
Build callbacks run once. Snapshots are detached operation-resolution state,
not full oscillator/envelope/machine saves. Wave uploads stop the hardware DAC.
Native timed execution/capture is unsupported; no JS timer substitution.

Completed locally. See [verification](notes/dmg-sid-timed-verification-20261121.md)
and its machine-readable receipt. Both dist and docs are ready. Listening,
commit/push, Pages deployment and further npm publication remain outside this task.

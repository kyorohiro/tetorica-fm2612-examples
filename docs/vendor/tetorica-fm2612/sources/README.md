# Sound-chip source bundles

C/C++ sound-chip cores and WASM build recipes are maintained in [tetorica-soundchip-native](https://github.com/kyorohiro/tetorica-soundchip-native). This package uses the fixed source snapshot recorded below; upstream component credits and licenses remain with their respective sources.

Fixed SDK 0.1.7, source commit 95cf71a857b15d0ea932ebf97d5fde80b5e80a95. The SDK provides 29 chip WASM recipes and 2 separate application-audio recipes and 2 standalone instrument recipes. Source receipts retain the archive and manifest hashes for an unpublished exact source commit.

See [SegaPSG.md](SegaPSG.md) for the original Tetorica Sega PSG core, BSD notice, hardware-documentation credit and standalone rebuild recipe. Rebuild from this directory with `sh scripts/build_segapsg_wasm.sh ../generated`.

See [Nuked-OPN2.md](Nuked-OPN2.md) for the fixed SDK sources, provenance and license. Rebuild with `sh scripts/build_nuked_opn2_wasm.sh ../generated`. Emscripten is required; no SDK checkout or Python importer is needed.

[SID.md](SID.md) and [SID8580.md](SID8580.md) describe the CPU-free 6581 and 8580 Preview instruments, readable host modules, original core sources, matching WASMs and standalone rebuild steps. Their checked application-local sources are separate from the fixed SDK snapshot above. The 8580 guide includes the npm metadata restoration step needed before an independent source rebuild.

[POKEY.md](POKEY.md) describes the BSD POKEY adaptation and original upstream source, with a standalone Emscripten recipe and fixed SDK provenance.

[CDDA.md](CDDA.md) and [MSM5205.md](MSM5205.md) describe the fixed SDK application-audio C/WASM sources, BSD attribution, source receipts and standalone rebuild recipes. These modules are cataloged separately from generic sound-chip IDs. Their recipes also rebuild without an SDK checkout or importer.

[NES-FDS.md](NES-FDS.md), [PWM32X.md](PWM32X.md) and [SNES-SPC.md](SNES-SPC.md) describe the other included source bundles and their respective licenses.

[PS1-SPU.md](PS1-SPU.md) describes the experimental PlayStation SPU port from the fixed SDK, complete BSD source, pristine upstream files and standalone rebuild recipe. This instrument is cataloged separately from the generic sound-chip factory.

[SCSP.md](SCSP.md) describes the Saturn SCSP/DSP sources, original MAME attribution, fixed SDK provenance and standalone rebuild recipe. The high-level JavaScript API currently exposes PCM instruments and per-slot hardware LFO / guarded sound-stack modulation; DSP controls remain a later stage.

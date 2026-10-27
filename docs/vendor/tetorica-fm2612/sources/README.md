# Sound-chip source bundles

See [SegaPSG.md](SegaPSG.md) for the original Tetorica Sega PSG core, BSD notice, hardware-documentation credit and standalone rebuild recipe. Rebuild from this directory with `sh scripts/build_segapsg_wasm.sh ../generated`.

See [Nuked-OPN2.md](Nuked-OPN2.md) for the fixed SDK sources, provenance and license. Rebuild with `sh scripts/build_nuked_opn2_wasm.sh ../generated`. Emscripten is required; no SDK checkout or Python importer is needed.

[POKEY.md](POKEY.md) describes the BSD POKEY adaptation and original upstream source, with a standalone Emscripten recipe and fixed SDK provenance.

[NES-FDS.md](NES-FDS.md), [PWM32X.md](PWM32X.md) and [SNES-SPC.md](SNES-SPC.md) describe the other included source bundles and their respective licenses.

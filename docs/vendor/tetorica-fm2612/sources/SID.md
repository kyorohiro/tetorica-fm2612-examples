# C64 SID / MOS 6581

See [the matching SID source kit](sid/README.md) for original source, marked patches, licenses, Native host and standalone WASM rebuild recipe. The core is a 6581 approximation under zlib; the Tetorica wrapper is BSD-3-Clause. It is separate from this package's fixed SDK snapshot. Browser modules remain readable at the package root: [SidCore](../sid.js) and [SidSynth](../sidsynth.js).

The additional CPU-free 8580 Preview and its matching source kit are described in [SID8580.md](SID8580.md). Neither instrument requires a C64 CPU, ROM or song.

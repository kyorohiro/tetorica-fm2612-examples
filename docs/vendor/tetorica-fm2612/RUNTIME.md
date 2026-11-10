# Full web runtime

Includes all 359 top-level web runtime modules and 28 generated chip/engine pairs.

ay8910, gameboy_apu, huc6280, wonderswan, pokey, k051649, nesapu, pwm32x, nuked_opn2, okim6258, rf5c164, segapcm, segapsg, spc, y8950, ym2151, ym2203, ym2413, ym2608, ym2610b, ym2612, ym3438, ym3526, ym3812, ymf262, ymf276, ymf278b, ymf288

C64 SID provides the CPU-free SidCore (6581 approximation), Sid8580Core (PAL 8580 Preview), SidSynth high-level voice/filter API and Web Audio Playground helpers. Import SidCore from sid.js or Sid8580Core from sid8580.js, then pass the core to new SidSynth({core}) from sidsynth.js. The browser Playground exposes C64 mode and its sid API. The package-root createSoundChip('sid') factory returns either raw core in direct mode and a generic browser endpoint with execution:'worklet'; model defaults to 6581 and the 8580 Preview requires PAL 985248 Hz. Direct results retain mono render()/renderInto(), numeric sampleRate and register access; Worklet output uses request() and explicit start()/stop()/dispose(). Factory clock maps to the core clockHz; no keyboard/preset allocation helpers are added. The model adapters use generated/sid/sid.wasm and generated/sid8580-machine/sid8580-endpoint.wasm respectively, without a C64 CPU, ROM or per-cycle JavaScript loop. Research calibration profiles default Off. The matching machine WASM and receipt are retained with the 8580 source kit for independent rebuilding; the CPU-free adapter loads only the endpoint. These application-local artifacts remain separate from this package's fixed SDK snapshot. See sources/SID.md and sources/SID8580.md for complete readable sources, marked patches, licenses, toolchain notices and rebuilding. No .sid song-playback application or Native audio-device host is included.

Saturn SCSP is another experimental standalone pair, with Scsp / ScspSynth and the Web Audio Playground API. Sources and the original rebuild recipe are under sources/scsp-sdk; see sources/SCSP.md. The package-root direct chip factory does not expose SCSP.

PlayStation SPU is an additional experimental standalone pair from the fixed SDK, cataloged as a separate instrument. Import Ps1Spu from ps1_spu.js and inject generated/ps1_spu_wasm.js explicitly; Ps1Synth adds sample instruments and Ps1Resampler converts native PCM to a host rate. The Browser Playground provides experimental PS1 mode with the spu API; compatible Tauri hosts also support primary and independent SPUs through the same SDK C++ core, including Main/Worker control. The package-root createSoundChip() factory does not expose PS1. Complete BSD source, pristine upstream snapshots and the unchanged build recipe are included; see sources/PS1-SPU.md.

CD-DA and MSM5205 are two additional application-audio WASM pairs, separate from the chip list. Their original C cores, bridges, BSD notices and SDK provenance are bundled. See sources/CDDA.md and sources/MSM5205.md for standalone recipes; no SDK checkout or importer is required.

NES/FDS asynchronous creation uses the shared C++ core through nesapu_wasm. Its synchronous NesApu constructor retains the JavaScript compatibility/reference renderer. See sources/NES-FDS.md for rebuilding and licenses/tetorica-nes for provenance.

32X PWM asynchronous creation uses the shared C++ core through pwm32x_wasm. The synchronous PWM32X constructor retains the JavaScript compatibility/reference renderer. Rebuild sources are in sources/wasm and sources/scripts; provenance is in licenses/mame-32x-pwm.

YM2610 uses ym2610b with variant:false; YM2610B is the default.
Chip APIs and high-level Synth coverage differ; inclusion does not imply a common Synth API for every chip.
No external sample/instrument ROMs are bundled. In particular, ym2608_adpcm_rom.bin and yrw801.rom are excluded.

Import only the chip you need. Files in the archive do not initialize engines automatically.
For a smaller application deployment, retain your entry point's dependencies, its WASM pair, and applicable licenses.

Name-based direct chip factory:

```javascript
import {createSoundChip} from './soundchip.js';
const chip = await createSoundChip('ym2610b');
try { const pcm = chip.generateStereo(128); } finally { chip.dispose(); }
```

The name-based factory also supports WonderSwan, POKEY and SID direct PCM generation; SID retains its mono render()/renderInto() API instead of generateStereo(). Chip-specific wrappers and audio engines provide additional entry points. See runtime-manifest.json for the exact contents.

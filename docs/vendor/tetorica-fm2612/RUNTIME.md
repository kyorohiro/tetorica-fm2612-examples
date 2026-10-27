# Full web runtime

Includes all 305 top-level web runtime modules and 28 generated chip/engine pairs.

ay8910, gameboy_apu, huc6280, wonderswan, pokey, k051649, nesapu, pwm32x, nuked_opn2, okim6258, rf5c164, segapcm, segapsg, spc, y8950, ym2151, ym2203, ym2413, ym2608, ym2610b, ym2612, ym3438, ym3526, ym3812, ymf262, ymf276, ymf278b, ymf288

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

The name-based factory also supports WonderSwan and POKEY direct PCM generation. Chip-specific wrappers and audio engines provide additional entry points. See runtime-manifest.json for the exact contents.

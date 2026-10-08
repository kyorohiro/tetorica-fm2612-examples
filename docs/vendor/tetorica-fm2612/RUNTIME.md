# Full web runtime

Includes all 149 top-level web runtime modules and 23 generated chip/engine pairs.

ay8910, gameboy_apu, huc6280, k051649, nuked_opn2, okim6258, rf5c164, segapcm, segapsg, y8950, ym2151, ym2203, ym2413, ym2608, ym2610b, ym2612, ym3438, ym3526, ym3812, ymf262, ymf276, ymf278b, ymf288

YM2610 uses ym2610b with variant:false; YM2610B is the default.
Chip APIs and high-level Synth coverage differ; inclusion does not imply a common Synth API for every chip.
No external sample/instrument ROMs are bundled. In particular, ym2608_adpcm_rom.bin and yrw801.rom are excluded.

Import only the chip you need. Files in the archive do not initialize engines automatically.
For a smaller application deployment, retain your entry point's dependencies, its WASM pair, and applicable licenses.

Yamaha convenience factory:

```javascript
import {createSoundChip} from './soundchip.js';
const chip = await createSoundChip('ym2610b');
try { const pcm = chip.generateStereo(128); } finally { chip.dispose(); }
```

Other chips use their individual wrappers/audio engines. See runtime-manifest.json for the exact contents.

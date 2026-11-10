import { SidCore } from './sid.js';
import { Sid8580Core } from './sid8580.js';
/** @param {import('./soundchip.js').SoundChipOptions} [options] */
export declare function validateSidSoundChipOptions(options?: import('./soundchip.js').SoundChipOptions): {
    model: "6581" | "8580";
    clockHz: number;
    sampleRate: number;
};
/** Load only the selected SID binary. The common factory uses its generated/
 * directory; individual SidCore imports keep their own historical defaults.
 * @param {import('./soundchip.js').SoundChipOptions} [options]
 * @returns {Promise<BufferSource>} */
export declare function loadSidSoundChipBinary(options?: import('./soundchip.js').SoundChipOptions): Promise<BufferSource>;
/** Return the existing low-level core, without initializing voices or opening
 * an audio device. A cancellation during WASM creation retires the late core.
 * @param {import('./soundchip.js').SoundChipOptions} [options]
 * @returns {Promise<SidCore|Sid8580Core>} */
export declare function createSidSoundChip(options?: import('./soundchip.js').SoundChipOptions): Promise<SidCore | Sid8580Core>;
/** The audio quantum already matches the SID core's configured rate. Copy its
 * mono output into both channels without a second resampler, filter or gain.
 * @param {SidCore|Sid8580Core} core */
export declare function createSidPCMRenderer(core: SidCore | Sid8580Core): {
    rate: number;
    resetHistory(): void;
    renderInto(left: any, right: any, offset?: number, frames?: number): void;
};

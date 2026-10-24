import { NesApuAudioEngine, validateNesApuClock } from './nesapuaudioengine.js';
export { validateNesApuClock };
export declare const NES_APU_CLOCK = 1789773;
/** NES APU with optional FDS. `new` retains the synchronous JavaScript reference
 * core; asynchronous create() uses the shared Native/WASM core by default. */
export declare class NesApu {
    clock: number;
    fdsEnabled: boolean;
    disposed: boolean;
    enableMask: number;
    backend: string;
    engine: NesApuAudioEngine;
    previousLeft: number | undefined;
    previousRight: number | undefined;
    filteredLeft: number | undefined;
    filteredRight: number | undefined;
    dcCoefficient: number | undefined;
    /** @param {{clock?: number, sampleRate?: number, fds?: boolean}} [options] */
    constructor({ clock, sampleRate, fds }?: {
        clock?: number;
        sampleRate?: number;
        fds?: boolean;
    });
    /** @param {import('./soundchip.js').SoundChipOptions} [options]
     * @returns {Promise<import('./nesapu_wasm.js').NesApuWasm>} */
    static create(options?: import('./soundchip.js').SoundChipOptions): Promise<import('./nesapu_wasm.js').NesApuWasm>;
    clearHistory(): void;
    check(): void;
    /** Native CPU addresses, including FDS $4023 and $4040–$408A.
     * @param {number} address @param {number} value */
    writeRegister(address: number, value: number): void;
    /** @param {Uint8Array} bytes @param {number} [address] */
    loadMemory(bytes: Uint8Array, address?: number): void;
    /** Preserve live DMC activity without restarting an already completed sample.
     * @param {number} channel @param {boolean} enabled */
    setChannelEnabled(channel: number, enabled: boolean): void;
    reset(): void;
    sampleRate(): number;
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
    /** @param {number} channel @param {boolean} muted */
    setChannelMuted(channel: number, muted: boolean): void;
    dispose(): void;
}

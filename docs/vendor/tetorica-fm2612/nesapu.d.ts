import { NesApuAudioEngine, validateNesApuClock } from './nesapuaudioengine.js';
export { validateNesApuClock };
export declare const NES_APU_CLOCK = 1789773;
/** NES APU with optional FDS. JavaScript cores; no CPU, cartridge or ROM required. */
export declare class NesApu {
    clock: number;
    fdsEnabled: boolean;
    disposed: boolean;
    enableMask: number;
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
    /** @param {{clock?: number, sampleRate?: number, fds?: boolean}} [options] */
    static create(options?: {
        clock?: number;
        sampleRate?: number;
        fds?: boolean;
    }): Promise<NesApu>;
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

/**
 * @file Shared low-level binding for YM3438 / YMF276 / YMF288.
 * 実行環境: Browser / Node.js。依存: 注入された WASM moduleFactory。
 * DOM・Web Audio は不要。
 */
export type OpnVariantApi = {
    create: () => number;
    destroy: (handle: number) => void;
    reset: (handle: number) => void;
    write: (handle: number, offset: number, value: number) => void;
    read: (handle: number, offset: number) => number;
    readStatus: (handle: number) => number;
    getIrq: (handle: number) => number;
    sampleRate: (handle: number, clock: number) => number;
    generate: (handle: number, left: number, right: number, frames: number) => void;
};
/**
 * @typedef {Object} OpnVariantApi
 * @property {() => number} create
 * @property {(handle: number) => void} destroy
 * @property {(handle: number) => void} reset
 * @property {(handle: number, offset: number, value: number) => void} write
 * @property {(handle: number, offset: number) => number} read
 * @property {(handle: number) => number} readStatus
 * @property {(handle: number) => number} getIrq
 * @property {(handle: number, clock: number) => number} sampleRate
 * @property {(handle: number, left: number, right: number, frames: number) => void} generate
 */
/** Native chip lifecycle and synchronous PCM generation. Prefer a named chip's create(). */
export declare class OpnVariant {
    module: Object;
    clock: number;
    /** @type {OpnVariantApi} */
    api: OpnVariantApi;
    handle: number;
    ptr: number;
    capacity: number;
    /**
     * @param {Object} module Initialized Emscripten module.
     * @param {number} clock Default input clock, Hz.
     */
    constructor(module: Object, clock: number);
    /** @private */
    private assertAlive;
    /** Reset registers and synthesis state; reapply presets afterward. @returns {void} */
    reset(): void;
    /** Release native resources. Repeated disposal is safe. @returns {void} */
    dispose(): void;
    /**
     * Write one bus byte (even offsets select a register, odd offsets write its data).
     * @param {number} offset Bus port, 0..3.
     * @param {number} value Byte, 0..255.
     * @returns {void}
     */
    write(offset: number, value: number): void;
    /**
     * @param {number} offset Bus port, 0..3 (not an arbitrary register address).
     * @returns {number} Chip read result.
     */
    read(offset: number): number;
    /** @returns {number} Native status flags. */
    readStatus(): number;
    /** @returns {boolean} Current IRQ state. */
    getIrq(): boolean;
    /**
     * Calculate output frames/second; does not resample or change the chip clock.
     * @param {number} [clock=this.clock] Positive integer input clock in Hz.
     * @returns {number} Native PCM sample rate.
     */
    sampleRate(clock?: number): number;
    /**
     * Advance synthesis and copy PCM out of WASM memory.
     * @param {number} frames Integer stereo frame count, 0..16777216.
     * @returns {{left: Float32Array, right: Float32Array}} Owned arrays surviving later calls/disposal.
     */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
}

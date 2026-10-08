/**
 * @file segapcm.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const SEGAPCM_CLOCK = 4000000;
export declare function validateSegaPcm({ clock, sampleRate }?: {
    clock?: number | undefined;
    sampleRate?: number | undefined;
}): void;
/**
 * SegaPcm chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class SegaPcm {
    #private;
    module: Object;
    handle: number;
    api: Object;
    ptr: number;
    capacity: number;
    sampleMemorySize: number;
    /**
     * Initialize SegaPcm and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {import("./soundchip.js").SoundChipOptions & {bankShift?: number, bankMask?: number}} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @param {number} [options.clock] Input chip clock in Hz.
     * @param {number} [options.sampleRate=44100] Generated PCM frames per second.
     * @returns {Promise<SegaPcm>} Ready-to-use chip; the caller must dispose it.
     */
    static create({ moduleFactory, moduleOptions, clock, sampleRate, bankShift, bankMask }?: import("./soundchip.js").SoundChipOptions & {
        bankShift?: number;
        bankMask?: number;
    }): Promise<SegaPcm>;
    /**
     * Wrap native resources allocated by create(); prefer the asynchronous factory.
     * @param {Object} module Initialized Emscripten module.
     * @param {number} handle Native chip handle owned by this instance.
     * @param {Object} api Bound native entry points.
     */
    constructor(module: Object, handle: number, api: Object);
    /**
     * Reject operations on a disposed native handle.
     * @returns {void}
     * @throws {Error} When the chip has been disposed.
     */
    assertAlive(): void;
    /**
     * Reset synthesis state for a new playback pass. Reapply voice and key registers afterward.
     * @returns {void}
     */
    reset(): void;
    /**
     * Write a register directly without rendering audio.
     * @param {number} offset Flat register-window address, 0..0xFFFF (VGM command 0xC0).
     * @param {number} value Register byte, 0..255.
     * @returns {void}
     */
    writeRegister(offset: number, value: number): void;
    /**
     * Copy a sample-memory region into the native chip.
     * @param {Uint8Array} data Bytes to load, not decoded audio samples.
     * @param {number} [offset=0] Destination byte offset.
     * @param {number} [memorySize=offset+data.length] Total addressable memory size in bytes.
     * @returns {void}
     */
    loadSampleMemory(data: Uint8Array, offset?: number, memorySize?: number): void;
    /**
     * Clear loaded sample memory. Load the required data again before PCM/ADPCM playback.
     * @returns {void}
     */
    clearSampleMemory(): void;
    /**
     * Set native channel mute bits; a set bit suppresses that channel.
     * @param {number} mask Integer bit mask in the native chip channel layout.
     * @returns {void}
     */
    setMuteMask(mask: number): void;
    /**
     * Return the configured PCM output rate.
     * @returns {number} Stereo frames per second.
     */
    sampleRate(): number;
    /**
     * Generate PCM synchronously, advancing the chip by the requested number of frames.
     * Returned arrays are copied from WASM memory and survive later generation/disposal.
     * @param {number} frames Nonnegative integer stereo frame count.
     * @returns {{left: Float32Array, right: Float32Array}} Owned PCM arrays at sampleRate().
     */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    supportsState(): boolean;
    saveState(): Readonly<{
        byteLength: any;
        sampleMemorySize: number;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
    /**
     * Release native chip state and allocated WASM buffers. Do not use the chip afterward.
     * @returns {void}
     */
    dispose(): void;
}

/**
 * @file gameboyapu.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const GAMEBOY_APU_CLOCK = 4194304;
export declare function validateGameboyApu({ clock, sampleRate }?: {
    clock?: number | undefined;
    sampleRate?: number | undefined;
}): void;
/**
 * GameboyApu chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class GameboyApu {
    module: Object;
    handle: number;
    api: Object;
    ptr: number;
    capacity: number;
    /**
     * Initialize GameboyApu and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {import("./soundchip.js").SoundChipOptions} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @param {number} [options.clock] Input chip clock in Hz.
     * @param {number} [options.sampleRate=44100] Generated PCM frames per second.
     * @returns {Promise<GameboyApu>} Ready-to-use chip; the caller must dispose it.
     */
    static create({ moduleFactory, moduleOptions, clock, sampleRate }?: import("./soundchip.js").SoundChipOptions): Promise<GameboyApu>;
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
     * @param {number} offset I/O address relative to 0xFF10; sound registers occupy 0x00..0x2F.
     * @param {number} value Register byte, 0..255.
     * @returns {void}
     */
    writeRegister(offset: number, value: number): void;
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
    /**
     * Release native chip state and allocated WASM buffers. Do not use the chip afterward.
     * @returns {void}
     */
    dispose(): void;
}

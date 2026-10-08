/**
 * @file rf5c164.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const RF5C164_CLOCK = 12500000;
export declare const RF5C164_SAMPLE_RATE = 44100;
/**
 * Rf5c164 chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class Rf5c164 {
    #private;
    module: Object;
    handle: number;
    api: Object;
    leftPtr: number;
    rightPtr: number;
    bufferFrames: number;
    /**
     * Wrap native resources allocated by create(); prefer the asynchronous factory.
     * @param {Object} module Initialized Emscripten module.
     * @param {number} handle Native chip handle owned by this instance.
     * @param {Object} api Bound native entry points.
     */
    constructor(module: Object, handle: number, api: Object);
    /**
     * Initialize Rf5c164 and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {Object} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @param {number} [options.clock] Input chip clock in Hz.
     * @param {number} [options.sampleRate=44100] Generated PCM frames per second.
     * @returns {Promise<Rf5c164>} Ready-to-use chip; the caller must dispose it.
     */
    static create(options?: Object): Promise<Rf5c164>;
    supportsState(): boolean;
    saveState(): Readonly<{
        byteLength: any;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
    /**
     * Release native chip state and allocated WASM buffers. Do not use the chip afterward.
     * @returns {void}
     */
    dispose(): void;
    /**
     * Reset synthesis state for a new playback pass. Reapply voice and key registers afterward.
     * @returns {void}
     */
    reset(): void;
    /**
     * Write a register directly without rendering audio.
     * @param {number} register Native control register index.
     * @param {number} value Register byte, 0..255.
     * @returns {void}
     */
    writeRegister(register: number, value: number): void;
    clearMemory(): void;
    readMemory(offset: any): any;
    /**
     * Read a chip bus/status value; not a saved copy of all written voice registers.
     * @param {number} offset Native bus offset.
     * @returns {number} Native read result.
     */
    read(offset: number): number;
    /**
     * Write through the currently selected 4 KiB CPU memory window.
     * @param {number} offset Window byte offset, 0..0xFFF.
     * @param {number} value Sample-memory byte.
     * @returns {void}
     */
    writeMemory(offset: number, value: number): void;
    /**
     * Copy bytes into absolute sample RAM, independent of the selected CPU bank.
     * @param {Uint8Array} data Encoded sample bytes.
     * @param {number} [offset=0] Absolute byte address; the entire range must fit in 64 KiB.
     * @returns {void}
     * @throws {RangeError} If the destination range exceeds RAM.
     */
    loadMemory(data: Uint8Array, offset?: number): void;
    /**
     * Load a VGM RAM block relative to the selected bank.
     * @param {Uint8Array} data Encoded sample bytes.
     * @param {number} [offset=0] Offset combined with the current bank base using bitwise OR.
     * @returns {void}
     */
    loadBankedMemory(data: Uint8Array, offset?: number): void;
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
}
/**
 * Convenience factory for Rf5c164. Does not create an audio device.
 * @param {function(Object): (Object|Promise<Object>)} moduleFactory Generated module factory.
 * @param {Object} [moduleOptions] Emscripten loader settings.
 * @returns {Promise<Rf5c164>} Chip instance owned by the caller.
 */
export declare function createRf5c164(moduleFactory: Function, moduleOptions?: Object): Promise<Rf5c164>;

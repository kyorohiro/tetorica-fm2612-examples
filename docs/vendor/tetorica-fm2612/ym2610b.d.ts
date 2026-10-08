/**
 * @file ym2610b.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const YM2610B_CLOCK = 8000000;
/**
 * Ym2610B chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class Ym2610B {
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
     * Initialize Ym2610B and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {import("./soundchip.js").SoundChipOptions} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @param {boolean} [options.variant=true] True for YM2610B; false for YM2610.
     * @returns {Promise<Ym2610B>} Ready-to-use chip; the caller must dispose it.
     */
    static create({ moduleFactory, moduleOptions, variant }?: import("./soundchip.js").SoundChipOptions): Promise<Ym2610B>;
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
     * Clear loaded ADPCM ROM regions.
     * @returns {void}
     */
    clearAdpcmRoms(): void;
    setSourceMuteMask(mask: any): void;
    loadAdpcmRom(type: any, bytes: any, offset?: number, size?: any): void;
    /**
     * Reset synthesis state for a new playback pass. Reapply voice and key registers afterward.
     * @returns {void}
     */
    reset(): void;
    /**
     * Write one bus byte. Use the chip register protocol rather than a MIDI channel number.
     * @param {number} offset Native bus address/data port offset.
     * @param {number} data Byte value, 0..255.
     * @returns {void}
     */
    write(offset: number, data: number): void;
    /**
     * Read a chip bus/status value; not a saved copy of all written voice registers.
     * @param {number} offset Native bus offset.
     * @returns {number} Native read result.
     */
    read(offset: number): number;
    /**
     * Read the primary status byte.
     * @returns {number} Status flags from the native core.
     */
    readStatus(): number;
    /**
     * Read the secondary status byte.
     * @returns {number} Secondary status flags from the native core.
     */
    readStatusHi(): number;
    /**
     * Read the current native interrupt line state.
     * @returns {boolean} True when IRQ is asserted. Requires a runtime with IRQ support.
     */
    getIrq(): boolean;
    /**
     * Return the native PCM rate for the requested clock; this does not resample audio.
     * @param {number} [clock] Chip input frequency in Hz.
     * @returns {number} Stereo frames per second.
     */
    sampleRate(clock?: number): number;
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
 * Convenience factory for Ym2610B. Does not create an audio device.
 * @param {function(Object): (Object|Promise<Object>)} moduleFactory Generated module factory.
 * @param {Object} [moduleOptions] Emscripten loader settings.
 * @returns {Promise<Ym2610B>} Chip instance owned by the caller.
 */
export declare function createYm2610B(moduleFactory: Function, moduleOptions?: Object): Promise<Ym2610B>;

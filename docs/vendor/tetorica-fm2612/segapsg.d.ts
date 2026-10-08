/**
 * @file segapsg.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const SEGAPSG_CLOCK = 3579545;
export declare const SEGAPSG_SAMPLE_RATE = 44100;
/**
 * SegaPSG chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class SegaPSG {
    #private;
    module: Object;
    handle: number;
    api: Object;
    leftPtr: number;
    rightPtr: number;
    bufferFrames: number;
    pcmView: {
        left: Float32Array<any>;
        right: Float32Array<any>;
    } | undefined;
    /**
     * Wrap native resources allocated by create(); prefer the asynchronous factory.
     * @param {Object} module Initialized Emscripten module.
     * @param {number} handle Native chip handle owned by this instance.
     * @param {Object} api Bound native entry points.
     */
    constructor(module: Object, handle: number, api: Object);
    /**
     * Initialize SegaPSG and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {Object} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @param {number} [options.clock] Input chip clock in Hz.
     * @param {number} [options.sampleRate=44100] Generated PCM frames per second.
     * @returns {Promise<SegaPSG>} Ready-to-use chip; the caller must dispose it.
     */
    static create(options?: Object): Promise<SegaPSG>;
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
     * Send a latched tone/noise/attenuation byte to the Sega PSG.
     * @param {number} data PSG command byte, 0..255.
     * @returns {void}
     */
    write(data: number): void;
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
     * Reserve PCM capacity without advancing the chip (for realtime initialization).
     * @param {number} frames Maximum expected stereo frame count.
     * @returns {void}
     */
    reserveStereoFrames(frames: number): void;
    /**
     * Generate borrowed views of WASM PCM, reusing arrays and the result object.
     * Read only the first `frames` entries; array length is reserved capacity.
     * Consume immediately: generation, buffer growth, or disposal invalidates the data.
     * Do not retain/mutate these views. Use generateStereo() for owned copies.
     * @param {number} frames Nonnegative integer frame count, up to 16777216.
     * @returns {{left: Float32Array, right: Float32Array}} Borrowed PCM views.
     */
    generateStereoView(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
}
/**
 * Convenience factory for SegaPSG. Does not create an audio device.
 * @param {function(Object): (Object|Promise<Object>)} moduleFactory Generated module factory.
 * @param {Object} [moduleOptions] Emscripten loader settings.
 * @returns {Promise<SegaPSG>} Chip instance owned by the caller.
 */
export declare function createSegaPSG(moduleFactory: Function, moduleOptions?: Object): Promise<SegaPSG>;

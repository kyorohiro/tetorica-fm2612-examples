/**
 * @file ymf278b.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const YMF278B_CLOCK = 33868800;
/**
 * Ymf278b chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class Ymf278b {
    #private;
    module: Object;
    handle: number;
    api: Object;
    hooks: {
        onWrite: undefined;
        onRead: undefined;
        onIrq: undefined;
    };
    lastIrqState: any;
    leftPtr: number;
    rightPtr: number;
    bufferFrames: number;
    sampleMemory: Uint8Array<ArrayBuffer>;
    fmMuteMask: number;
    pcmMuteMask: number;
    /**
     * Wrap native resources allocated by create(); prefer the asynchronous factory.
     * @param {Object} module Initialized Emscripten module.
     * @param {number} handle Native chip handle owned by this instance.
     * @param {Object} api Bound native entry points.
     */
    constructor(module: Object, handle: number, api: Object);
    /**
     * Initialize Ymf278b and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {Object} [options={}] Chip and Emscripten initialization settings.
     * @param {function(Object): (Object|Promise<Object>)} options.moduleFactory Generated WASM module factory.
     * @param {Object} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @returns {Promise<Ymf278b>} Ready-to-use chip; the caller must dispose it.
     */
    static create(options?: Object): Promise<Ymf278b>;
    /**
     * Release native chip state and allocated WASM buffers. Do not use the chip afterward.
     * @returns {void}
     */
    dispose(): void;
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
     * Mute any of the 18 FM channels.
     * @param {number} mask Bits 0..17 correspond to physical FM CH1..CH18; 1 means muted.
     * @returns {void}
     */
    setFmMuteMask(mask: number): void;
    /**
     * Mute any of the 24 PCM voices.
     * @param {number} mask Bits 0..23 correspond to PCM CH1..CH24; 1 means muted.
     * @returns {void}
     */
    setPcmMuteMask(mask: number): void;
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
     * Read the current native interrupt line state.
     * @returns {boolean} True when IRQ is asserted. Requires a runtime with IRQ support.
     */
    getIrq(): boolean;
    /**
     * Replace register/IRQ observers; omitted callbacks are removed.
     * Callbacks execute synchronously. IRQ notifications are checked at API boundaries.
     * @param {Object} [hooks={}] Optional callback functions.
     * @param {function({offset:number,data:number}):void} [hooks.onWrite] Called after a bus write.
     * @param {function({offset:number,value:number}):void} [hooks.onRead] Called after a read.
     * @param {function(boolean):void} [hooks.onIrq] Called with current/changed IRQ state.
     * @returns {void}
     */
    setHooks(hooks?: Object): void;
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
 * Convenience factory for Ymf278b. Does not create an audio device.
 * @param {function(Object): (Object|Promise<Object>)} moduleFactory Generated module factory.
 * @param {Object} [moduleOptions] Emscripten loader settings.
 * @returns {Promise<Ymf278b>} Chip instance owned by the caller.
 */
export declare function createYmf278b(moduleFactory: Function, moduleOptions?: Object): Promise<Ymf278b>;

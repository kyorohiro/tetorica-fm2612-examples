/**
 * @file ym2608.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
export declare const YM2608_CLOCK = 8000000;
export declare const YM2608_ADPCM_B_MEMORY_SIZE = 2097152;
export type Ym2608OutputGains = {
    fm: number;
    ssg: number;
};
export type Ym2608OutputGainPatch = {
    fm?: number;
    ssg?: number;
};
/** @typedef {{fm:number,ssg:number}} Ym2608OutputGains */
/** @typedef {{fm?:number,ssg?:number}} Ym2608OutputGainPatch */
/** Validate host-side output gains before changing either bus.
 * FM includes the chip's already combined Rhythm and ADPCM-B outputs.
 * @param {Ym2608OutputGainPatch} gains Partial linear gains, each 0..1024.
 * @param {Ym2608OutputGains} [current] Previously accepted gains.
 * @returns {Ym2608OutputGains} Detached validated gains.
 */
export declare function normalizeYm2608OutputGains(gains: Ym2608OutputGainPatch, current?: Ym2608OutputGains): Ym2608OutputGains;
/**
 * Ym2608 chip instance backed by WASM. No AudioContext or playback device is created.
 * Use create() to initialize and dispose() to release native resources.
 * Register writes program the chip; generateStereo() advances it to produce PCM.
 */
export declare class Ym2608 {
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
    outputGains: {
        fm: number;
        ssg: number;
    };
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
     * Initialize Ym2608 and its native WASM module.
     * The generated module factory is injected so browser and Node callers can choose asset loading.
     * @param {Object} [options={}] Chip and Emscripten initialization settings.
     * @param {import('./soundchip.js').WasmModuleFactory} options.moduleFactory Generated WASM module factory.
     * @param {import('./soundchip.js').WasmModuleOptions} [options.moduleOptions] Forwarded loader options, e.g. wasmBinary or locateFile.
     * @returns {Promise<Ym2608>} Ready-to-use chip; the caller must dispose it.
     */
    static create(options?: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        moduleOptions?: import('./soundchip.js').WasmModuleOptions;
    }): Promise<Ym2608>;
    supportsState(): boolean;
    /** @returns {Readonly<{byteLength:number}>} Opaque snapshot owned by this instance. */
    saveState(): Readonly<{
        byteLength: number;
    }>;
    /** @param {Readonly<{byteLength:number}>} state Snapshot returned by this instance. */
    validateState(state: Readonly<{
        byteLength: number;
    }>): void;
    /** @param {Readonly<{byteLength:number}>} state Snapshot returned by this instance. */
    loadState(state: Readonly<{
        byteLength: number;
    }>): void;
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
    /** @param {Uint8Array} bytes
     * @param {number} [offset] */
    loadAdpcmARom(bytes: Uint8Array, offset?: number): void;
    /** @param {Uint8Array} bytes
     * @param {number} memorySize
     * @param {number} [offset] */
    loadAdpcmBMemory(bytes: Uint8Array, offset?: number, memorySize?: number): void;
    clearAdpcmBMemory(): void;
    /** @param {number} mask */
    setSourceMuteMask(mask: number): void;
    /** Set host software gain before combining the FM-side stereo bus and SSG.
     * The FM-side bus includes Rhythm and ADPCM-B. Gains survive reset and state restore.
     * @param {Ym2608OutputGainPatch} gains Partial linear gain multipliers, each 0..1024.
     * @returns {Ym2608OutputGains} Accepted output gains.
     */
    setOutputGains(gains: Ym2608OutputGainPatch): Ym2608OutputGains;
    /** @returns {Ym2608OutputGains} Detached linear output gain multipliers. */
    getOutputGains(): Ym2608OutputGains;
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
 * Convenience factory for Ym2608. Does not create an audio device.
 * @param {function(Object): (Object|Promise<Object>)} moduleFactory Generated module factory.
 * @param {Object} [moduleOptions] Emscripten loader settings.
 * @returns {Promise<Ym2608>} Chip instance owned by the caller.
 */
export declare function createYm2608(moduleFactory: Function, moduleOptions?: Object): Promise<Ym2608>;

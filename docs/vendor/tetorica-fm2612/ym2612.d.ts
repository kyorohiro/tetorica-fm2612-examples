/**
 * @file ym2612.js
 * 実行環境: Browser / Node.js
 * 依存: WASM（moduleFactory と moduleOptions で読み込み方法を注入）。
 * チップ操作・PCM 生成に DOM・AudioContext は不要。ローダーは実行環境に合わせて渡す。
 */
/**
 * Low-level YM2612 WASM wrapper shared by browser and Node callers.
 * It performs synchronous register I/O and offline PCM generation, without
 * scheduling playback or creating an audio device. For note/preset helpers,
 * connect this chip to YM2612Synth using YM2612DirectTransport.
 * @module
 */
export type Ym2612ModuleOptions = {
    /**
     * Preloaded WASM bytes; Node Buffers are accepted.
     */
    wasmBinary?: Uint8Array;
    /**
     * Resolve an asset filename and loader prefix to its URL or filesystem path.
     * Other Emscripten module options are also passed through to the factory.
     */
    locateFile?: (filename: string, prefix: string) => string;
};
export type Ym2612ModuleFactory = (options: Ym2612ModuleOptions) => Object | Promise<Object>;
export type Ym2612StereoPcm = {
    /**
     * Left PCM samples, copied out of WASM memory.
     */
    left: Float32Array;
    /**
     * Right PCM samples, copied out of WASM memory.
     */
    right: Float32Array;
};
export type Ym2612Hooks = {
    /**
     * Called after each bus write, with offset 0..3 and the supplied data byte.
     */
    onWrite?: (event: {
        offset: number;
        data: number;
    }) => void;
    /**
     * Called after each bus/status read, with the returned value.
     */
    onRead?: (event: {
        offset: number;
        value: number;
    }) => void;
    /**
     * Called with the current IRQ state when installed, then when a checked state changes.
     */
    onIrq?: (asserted: boolean) => void;
};
export type Ym2612NativeApi = {
    /**
     * Allocate a native chip and return its handle.
     */
    create: () => number;
    /**
     * Release the native chip.
     */
    destroy: (handle: number) => void;
    /**
     * Reset chip state.
     */
    reset: (handle: number) => void;
    /**
     * Write a bus byte.
     */
    write: (handle: number, offset: number, data: number) => void;
    /**
     * Read a bus byte.
     */
    read?: (handle: number, offset: number) => number;
    /**
     * Read native status flags.
     */
    readStatus?: (handle: number) => number;
    /**
     * Read IRQ state (zero or nonzero).
     */
    getIrq?: (handle: number) => number;
    /**
     * Convert input clock Hz to PCM frames/second.
     */
    sampleRate: (handle: number, clock: number) => number;
    /**
     * Write stereo PCM into caller-allocated WASM buffers.
     */
    generate: (handle: number, leftPtr: number, rightPtr: number, frames: number) => void;
    /**
     * Write PCM and four envelope buffers for a zero-based physical channel.
     */
    generateWithInternalEnvelope: (handle: number, leftPtr: number, rightPtr: number, env0Ptr: number, env1Ptr: number, env2Ptr: number, env3Ptr: number, frames: number, channel: number) => void;
};
/**
 * @typedef {Object} Ym2612ModuleOptions
 * @property {Uint8Array} [wasmBinary] Preloaded WASM bytes; Node Buffers are accepted.
 * @property {(filename: string, prefix: string) => string} [locateFile]
 * Resolve an asset filename and loader prefix to its URL or filesystem path.
 * Other Emscripten module options are also passed through to the factory.
 */
/**
 * @callback Ym2612ModuleFactory
 * @param {Ym2612ModuleOptions} options Emscripten initialization options.
 * @returns {Object|Promise<Object>} Initialized module with cwrap, heap and allocation APIs.
 */
/**
 * @typedef {Object} Ym2612StereoPcm
 * @property {Float32Array} left Left PCM samples, copied out of WASM memory.
 * @property {Float32Array} right Right PCM samples, copied out of WASM memory.
 */
/**
 * @typedef {Object} Ym2612Hooks
 * @property {(event: {offset: number, data: number}) => void} [onWrite]
 * Called after each bus write, with offset 0..3 and the supplied data byte.
 * @property {(event: {offset: number, value: number}) => void} [onRead]
 * Called after each bus/status read, with the returned value.
 * @property {(asserted: boolean) => void} [onIrq]
 * Called with the current IRQ state when installed, then when a checked state changes.
 */
/**
 * Bound native exports. Handles and pointers are numeric WASM addresses, not JS arrays.
 * Optional read/IRQ exports may be absent in older builds.
 * @typedef {Object} Ym2612NativeApi
 * @property {() => number} create Allocate a native chip and return its handle.
 * @property {(handle: number) => void} destroy Release the native chip.
 * @property {(handle: number) => void} reset Reset chip state.
 * @property {(handle: number, offset: number, data: number) => void} write Write a bus byte.
 * @property {(handle: number, offset: number) => number} [read] Read a bus byte.
 * @property {(handle: number) => number} [readStatus] Read native status flags.
 * @property {(handle: number) => number} [getIrq] Read IRQ state (zero or nonzero).
 * @property {(handle: number, clock: number) => number} sampleRate Convert input clock Hz to PCM frames/second.
 * @property {(handle: number, leftPtr: number, rightPtr: number, frames: number) => void} generate
 * Write stereo PCM into caller-allocated WASM buffers.
 * @property {(handle: number, leftPtr: number, rightPtr: number, env0Ptr: number, env1Ptr: number, env2Ptr: number, env3Ptr: number, frames: number, channel: number) => void} generateWithInternalEnvelope
 * Write PCM and four envelope buffers for a zero-based physical channel.
 */
/** Default YM2612 input clock in Hz; this is not the PCM sample rate. @type {number} */
export declare const YM2612_CLOCK: number;
/**
 * One mutable YM2612 emulation instance and its reusable WASM output buffers.
 * Create with {@link Ym2612.create} or {@link createYm2612}, and dispose when done.
 * Generation advances chip state; register writes alone do not render audio.
 */
export declare class Ym2612 {
    #private;
    module: Object;
    handle: number;
    api: Ym2612NativeApi;
    hooks: {
        onWrite: undefined;
        onRead: undefined;
        onIrq: undefined;
    };
    lastIrqState: any;
    leftPtr: number;
    rightPtr: number;
    envPtrs: number[];
    bufferFrames: number;
    pcmView: {
        left: Float32Array<any>;
        right: Float32Array<any>;
    } | undefined;
    /**
     * Wrap an already allocated native chip. Prefer create() for normal use.
     * @param {Object} module Initialized Emscripten module.
     * @param {number} handle Native chip pointer owned by this instance.
     * @param {Ym2612NativeApi} api Bound native exports from create().
     */
    constructor(module: Object, handle: number, api: Ym2612NativeApi);
    /**
     * Load the YM2612 WASM module and create a chip instance.
     * This creates the emulation core only, not an AudioContext, AudioWorklet,
     * or YM2612Synth. Use generateStereo() to generate PCM at sampleRate(),
     * and call dispose() when finished to release WASM resources.
     *
     * @param {object} [options={}] Initialization options; moduleFactory is required.
     * @param {Ym2612ModuleFactory} options.moduleFactory
     *   Default export of the generated ym2612_wasm.js Emscripten module.
     * @param {object} [options.moduleOptions] Options passed unchanged to moduleFactory.
     * @param {Uint8Array} [options.moduleOptions.wasmBinary]
     *   Preloaded WASM bytes (for example, a Buffer from node:fs/promises readFile).
     *   If omitted, the generated module uses its default WASM loading mechanism.
     * @param {(filename: string, prefix: string) => string} [options.moduleOptions.locateFile]
     *   Resolve an asset path and loader prefix to a URL or filesystem path,
     *   when the WASM asset is hosted separately from the generated JavaScript.
     * @returns {Promise<Ym2612>} A chip ready for register writes and PCM generation.
     * @throws {Error} Rejects if moduleFactory is missing or module initialization fails.
     * @example
     * const chip = await Ym2612.create({ moduleFactory: ym2612ModuleFactory });
     * try {
     *   // Configure registers before generating sound.
     *   const pcm = chip.generateStereo(1024);
     * } finally {
     *   chip.dispose();
     * }
     */
    static create(options?: {
        moduleFactory: Ym2612ModuleFactory;
        moduleOptions?: {
            wasmBinary?: Uint8Array;
            locateFile?: (filename: string, prefix: string) => string;
        };
    }): Promise<Ym2612>;
    supportsState(): boolean;
    saveState(): Readonly<{
        byteLength: any;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
    /**
     * Free the chip and its WASM buffers. Repeated disposal is safe.
     * Previously returned PCM arrays remain valid because they are copies.
     * Do not read, write, reset or generate with this instance afterward.
     * @returns {void}
     */
    dispose(): void;
    /**
     * Reset native registers and synthesis state, then check IRQ state.
     * Retains installed hooks and allocated output buffers. Reapply your voice
     * and frequency settings before generating the next sound.
     * @returns {void}
     */
    reset(): void;
    /**
     * Write one YM2612 bus byte, not a register/value pair.
     * Offsets: 0 = bank 0 address, 1 = bank 0 data,
     * 2 = bank 1 address, 3 = bank 1 data. Use writeRegister() for a pair.
     * Calls onWrite synchronously and checks IRQ after the write.
     * @param {number} offset Bus offset, 0..3.
     * @param {number} data Byte, 0..255. Values are passed to the native core.
     * @returns {void}
     */
    write(offset: number, data: number): void;
    /**
     * Read a bus offset using the core's YM2612 read semantics.
     * This is not arbitrary register readback; keep a separate register shadow
     * if you need to inspect previously written voice parameters.
     * Calls onRead synchronously and checks IRQ.
     * @param {number} offset Bus offset, 0..3.
     * @returns {number} Native read result as an unsigned byte.
     * @throws {Error} If the loaded WASM runtime has no read export.
     */
    read(offset: number): number;
    /**
     * Read native status (including timer flags) and notify onRead at offset 0.
     * Falls back to read(0) when the dedicated status export is unavailable.
     * @returns {number} Status byte; interpretation follows the native core.
     * @throws {Error} If neither status nor bus reading is available.
     */
    readStatus(): number;
    /**
     * Query whether the native IRQ line is asserted, without notifying hooks.
     * @returns {boolean} True when IRQ is asserted.
     * @throws {TypeError} If the loaded runtime lacks the optional IRQ export.
     */
    getIrq(): boolean;
    /**
     * Replace all observation callbacks; omitted callbacks are removed.
     * Call with no arguments to clear them. Callbacks run synchronously and
     * their exceptions propagate. IRQ is checked after writes, reads, reset
     * and generation; this is not a per-sample IRQ trace during generation.
     * @param {Ym2612Hooks} [hooks={}] Optional observers, each a function or undefined.
     * @returns {void}
     * @throws {Error} If a supplied observer is not a function.
     */
    setHooks(hooks?: Ym2612Hooks): void;
    /**
     * Write an address byte followed by a data byte to one register bank.
     * Unlike write(), port denotes the bank, not a bus offset.
     * Triggers two onWrite callbacks through write().
     * @param {number} register Register address within the bank, 0..255.
     * @param {number} value Register data byte, 0..255.
     * @param {number} [port=0] Bank 0 or 1 (implementation maps any nonzero value to 1).
     * @returns {void}
     */
    writeRegister(register: number, value: number, port?: number): void;
    /**
     * Query the native PCM frame rate for an input clock in Hz.
     * Does not resample, configure an AudioContext or change the output buffers.
     * Interpret generated PCM at this rate; resample separately if you need 44.1 kHz.
     * @param {number} [clock=YM2612_CLOCK] Positive chip input clock in Hz.
     * @returns {number} Native stereo frames per second for the supplied clock.
     */
    sampleRate(clock?: number): number;
    /**
     * Synchronously advance the chip and generate stereo PCM without real-time waits.
     * One frame contains one left and one right sample. The native wrapper
     * clips integer output to 16-bit range and divides by 32768.
     * Returned arrays are independent copies, safe across later generation/disposal.
     * Large requests allocate WASM buffers plus JS copies; use chunks for long audio.
     * @param {number} frames Integer frame count, 0..16777216 inclusive.
     * @returns {Ym2612StereoPcm} Two arrays of length frames, at sampleRate().
     * @throws {RangeError} If frames is not an integer in the supported range.
     */
    generateStereo(frames: number): Ym2612StereoPcm;
    /**
     * Generate full-chip stereo PCM and four envelope traces for one physical channel.
     * Advances synthesis just like generateStereo(); this is not a read-only peek.
     * Envelope arrays use register slot order (+0, +4, +8, +12), not algorithm
     * signal-flow order. Each value is 1 - min(attenuation, 1023) / 1023:
     * an internal attenuation visualization, not linear gain, RMS or operator audio.
     * All returned arrays are copies independent of the WASM heap.
     * @param {number} frames Integer frame count, 0..16777216 inclusive.
     * @param {number} [channel=0] Physical channel index 0..5 (CH1..CH6).
     * @returns {{left: Float32Array, right: Float32Array, envelopes: Float32Array[]}}
     * Full stereo mix plus four arrays of length frames for the selected channel.
     * @throws {RangeError} If frames is outside the supported integer range.
     */
    generateStereoWithInternalEnvelope(frames: number, channel?: number): {
        left: Float32Array;
        right: Float32Array;
        envelopes: Float32Array[];
    };
    /**
     * Grow reusable stereo/envelope WASM buffers as needed; never shrink them here.
     * @param {number} frames Requested frame capacity; validated before allocation.
     * @returns {void}
     * @throws {RangeError} For invalid frame counts.
     */
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
 * Convenience form of Ym2612.create({ moduleFactory, moduleOptions }).
 * Returns the chip only; it does not create a Synth, AudioWorklet or audio device.
 * The caller owns the instance and must call dispose() when finished.
 * @param {Ym2612ModuleFactory} moduleFactory Generated ym2612_wasm.js default export.
 * @param {Ym2612ModuleOptions} [moduleOptions] WASM bytes, asset resolver or other loader options.
 * @returns {Promise<Ym2612>} Initialized native chip wrapper.
 * @throws {Error} Rejects when initialization fails or the factory is missing.
 * @example
 * const chip = await createYm2612(ym2612ModuleFactory);
 */
export declare function createYm2612(moduleFactory: Ym2612ModuleFactory, moduleOptions?: Ym2612ModuleOptions): Promise<Ym2612>;

/**
 * Accurate SNES SPC playback and DSP-only synthesis. No DOM or audio device.
 * PCM is stereo Float32 at the fixed native rate of 32,000 frames/second.
 * Supply the generated spc_wasm module factory; resample at the output boundary.
 */
export declare const SPC_SAMPLE_RATE = 32000;
export type SpcCoreOptions = {
    moduleFactory: (options?: {
        wasmBinary?: Uint8Array | ArrayBuffer;
    }) => any;
    moduleOptions?: {
        wasmBinary?: Uint8Array | ArrayBuffer;
    };
};
declare class Core {
    module: any;
    handle: number;
    sampleRate: number;
    _heapBuffer: any;
    _left: Float32Array<any> | null;
    _right: Float32Array<any> | null;
    /** @param {any} module @param {number} handle */
    constructor(module: any, handle: number);
    static _create(options?: {}, dspOnly?: boolean): Promise<Core>;
    _assertOpen(): void;
    _syncViews(): void;
    _check(result: any): void;
    _withBytes(bytes: any, callback: any): any;
    /** Total native 32 kHz sample pairs rendered since load/reset. @returns {number} */
    get nativeFrames(): number;
    /**
     * Write native stereo frames into caller-owned arrays. The offset is an output
     * array index, not a source-file position or audio-clock reservation.
     * No temporary PCM arrays are allocated once WASM memory has stopped growing.
     * @param {Float32Array} left @param {Float32Array} right
     * @param {number} [frames] @param {number} [offset]
     */
    renderInto(left: Float32Array, right: Float32Array, frames?: number, offset?: number): void;
    /**
     * Bits 0..7 select muted voices. Oscillators, envelopes, BRR and pitch
     * modulation keep advancing. Existing echo tails remain audible; newly mixed
     * dry output and echo sends from these voices are suppressed. No KOFF injected.
     * Samples already queued inside the upstream core are not rewritten.
     * @param {number} mask
     */
    setMuteMask(mask: number): void;
    /** Atomic copied analysis data, not a complete restorable emulator state.
     * @returns {{ram:Uint8Array,dsp:Uint8Array,nativeFrames:number}} */
    snapshot(): {
        ram: Uint8Array;
        dsp: Uint8Array;
        nativeFrames: number;
    };
    /** Release this instance only. Idempotent. */
    dispose(): void;
}
export declare class SpcCore extends Core {
    /** @param {SpcCoreOptions} options @returns {Promise<SpcCore>} */
    static create(options: SpcCoreOptions): Promise<SpcCore>;
    /** Load an SPC snapshot and reset nativeFrames. Failed validation preserves playback.
     * @param {ArrayBuffer|ArrayBufferView} value */
    load(value: ArrayBuffer | ArrayBufferView): void;
    /** Reload the original snapshot, including its original echo RAM. Keeps mute mask. */
    restart(): void;
    reset(): void;
}
export { SpcCore as SpcPlayerCore };
/** DSP-only core for authored BRR instruments; no SPC700 CPU or driver runs. */
export declare class SnesDspCore extends Core {
    /** @param {SpcCoreOptions} options @returns {Promise<SnesDspCore>} */
    static create(options: SpcCoreOptions): Promise<SnesDspCore>;
    /** Clear RAM and reset DSP registers, keeping the output mute mask. */
    reset(): void;
    /** @param {ArrayBuffer|ArrayBufferView} value @param {number} [offset] */
    loadRam(value: ArrayBuffer | ArrayBufferView, offset?: number): void;
    /** @param {number} reg @param {number} value */
    writeDsp(reg: number, value: number): void;
    /** @param {number} reg @returns {number} */
    readDsp(reg: number): number;
}

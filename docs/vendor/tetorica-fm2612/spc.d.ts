/**
 * Accurate SNES SPC playback and DSP-only synthesis. No DOM or audio device.
 * PCM is stereo Float32 at the fixed native rate of 32,000 frames/second.
 * Supply the generated spc_wasm module factory; resample at the output boundary.
 */
export declare const SPC_SAMPLE_RATE = 32000;
export declare const SPC_TRACE_CLOCK_RATE = 1024000;
export declare const SPC_TRACE_MAX_EVENTS = 1000000;
export type SpcTimeline = {
    version: 1;
    clockRate: 1024000;
    durationClocks: number;
    initialState: {
        ram: Uint8Array;
        dsp: Uint8Array;
        outputDelayFrames: 4;
    };
    events: Uint32Array | number[];
};
export type SpcTimelineState = {
    loaded: boolean;
    positionFrames: number;
    totalFrames: number;
    ended: boolean;
};
export type SpcCoreOptions = {
    moduleFactory: (options?: {
        wasmBinary?: Uint8Array | ArrayBuffer;
    }) => any;
    moduleOptions?: {
        wasmBinary?: Uint8Array | ArrayBuffer;
    };
};
/** Validate/copy an editable DSP/RAM trace without initializing WASM or audio.
 * Four uint32 words per event: effective DSP clock, kind (0 DSP / 1 RAM),
 * address, byte value. These clocks preserve the accurate core's observed
 * ordering, including its deferred DSP catch-up; they are not raw CPU timestamps.
 * Capture starts at a freshly loaded SPC's DSP.load phase, with upstream's
 * four-frame output FIFO. Arbitrary mid-song snapshots are not restorable here.
 * @param {SpcTimeline} trace
 * @returns {SpcTimeline & {events:Uint32Array}}
 */
export declare function prepareSpcTimeline(trace: SpcTimeline): SpcTimeline & {
    events: Uint32Array;
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
    _dspObserverCapacity: number | undefined;
    _dspObserverWords: Uint32Array<any> | undefined;
    /** @param {SpcCoreOptions} options @returns {Promise<SpcCore>} */
    static create(options: SpcCoreOptions): Promise<SpcCore>;
    /** Load an SPC snapshot and reset nativeFrames. Failed validation preserves playback.
     * @param {ArrayBuffer|ArrayBufferView} value */
    load(value: ArrayBuffer | ArrayBufferView): void;
    /** Reload the original snapshot, including its original echo RAM. Keeps mute mask. */
    restart(): void;
    reset(): void;
    /** Enable bounded DSP-write observation at the current position without
     * resetting phase/envelopes. Draining is independent of offline RAM tracing.
     * @param {{capacity?:number}} [options] */
    startDspObservation({ capacity }?: {
        capacity?: number;
    }): void;
    stopDspObservation(): void;
    /** Write ordered triples [absolute DSP clock, register, value] into owned
     * preallocated storage. Returns event count; clocks retain precision past 2^32.
     * @param {Float64Array} output @returns {number} */
    drainDspEventsInto(output: Float64Array): number;
    /** Return/reset lost-write count. Overflow never stops or changes playback. */
    takeDspEventOverflow(): any;
    /** @param {Uint8Array} output */
    readDspRegistersInto(output: Uint8Array): void;
    /** Discover the union of physical DSP RAM reads over an offline interval.
     * Start fresh/unmuted, render with the same partition and duration as the
     * following trace, then restart before beginTrace({ramReadMask}). The bounded
     * 65536-byte mask includes directory, BRR and echo reads for silent voices too.
     */
    beginRamReadTracking(): void;
    /** End discovery and return an owned 65536-byte 0/1 mask.
     * @returns {Uint8Array} */
    endRamReadTracking(): Uint8Array;
    /** Begin bounded offline recording before rendering any frames after load.
     * Same-address RAM writes between DSP advances are coalesced: the DSP never
     * observed those intermediate values. A limit failure rejects the whole trace.
     * Supply only a mask from a complete identical discovery pass; excluded working
     * RAM cannot later be repurposed by edits without capturing that data again.
     * @param {{maxEvents?:number,ramReadMask?:Uint8Array}} [options]
     */
    beginTrace({ maxEvents, ramReadMask }?: {
        maxEvents?: number;
        ramReadMask?: Uint8Array;
    }): void;
    /** Stop capture and return independent copied initial bytes and packed events.
     * @returns {SpcTimeline & {events:Uint32Array}} */
    endTrace(): SpcTimeline & {
        events: Uint32Array;
    };
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
    /** Prepare raw original RAM and exact sub-sample DSP/RAM events. Instrument
     * sample allocation/presets must not be mixed with this raw timeline mode.
     * @param {SpcTimeline} trace @returns {SpcTimelineState} */
    loadTimeline(trace: SpcTimeline): SpcTimelineState;
    /** Restart prepared state without reallocating/copying the event list. */
    restartTimeline(): SpcTimelineState;
    /** @returns {SpcTimelineState} */
    getTimelineState(): SpcTimelineState;
}

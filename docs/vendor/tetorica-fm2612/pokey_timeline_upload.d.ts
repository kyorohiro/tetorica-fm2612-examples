export declare const POKEY_TIMELINE_CHUNK_BYTES = 16384;
export declare const POKEY_TIMELINE_VALIDATE_WRITES_PER_QUANTUM = 1024;
/** Stage transferred chunks without scanning or copying them in a port handler.
 * The caller gives up ownership of every appended chunk and of the prepared
 * result. Only step() examines bytes; its work is bounded by both bytes and
 * completed writes. Partial deltas and register pairs survive chunk boundaries.
 * @param {any} header
 * @param {{sampleRate?:number}} [options] */
export declare function createPokeyTimelineUpload(header: any, { sampleRate }?: {
    sampleRate?: number;
}): {
    readonly byteLength: any;
    readonly receivedBytes: number;
    readonly validatedBytes: number;
    readonly validatedWrites: number;
    append(chunk: any): void;
    step(maxWrites?: number): {
        chunkDone: boolean;
        complete: boolean;
        validatedBytes: number;
        validatedWrites: number;
    };
    finish(): Readonly<{
        version: 1;
        clock: number;
        durationSamples: any;
        chunks: any[];
        byteLength: any;
    }>;
};
/** Allocation-free traversal of validated owned chunks. No typed-array views
 * are constructed when a record or delta crosses a chunk boundary. */
export declare function createPokeyChunkTimelineCursor(prepared: any, sampleRate: any): {
    durationFrames: number;
    nextFrame: () => number;
    advance(frame: any, apply: any): void;
};

export declare const POKEY_TIMELINE_MAX_BYTES: number;
export declare const POKEY_TIMELINE_MAX_WRITES_PER_QUANTUM = 512;
export declare function pokeyTimelineInteger(value: any, maximum: any, label: any): any;
/** Decode one canonical unsigned delta and register/byte pair into owned state.
 * The same decoder is used by preparation, builders and the render cursor. */
export declare function readPokeyTimelinePoint(data: any, state: any): number;
/** Own a compact single-chip trace. Times always use 44100-Hz VGM samples;
 * clock is the physical chip clock, never the output scheduling rate.
 * @param {any} trace
 * @param {{sampleRate?:number}} [options] */
export declare function preparePokeyTimeline(trace: any, { sampleRate }?: {
    sampleRate?: number;
}): {
    version: number;
    clock: number;
    durationSamples: any;
    data: Uint8Array<any>;
};
/** Allocation-free traversal after preparation. Same-time writes retain their
 * byte order and fractional sample boundaries round up to the next frame. */
export declare function createPokeyTimelineCursor(prepared: any, sampleRate: any): {
    durationFrames: number;
    nextFrame: () => number;
    advance(frame: any, apply: any): void;
};

export declare const WONDERSWAN_TIMELINE_MAX_BYTES: number;
export declare const WONDERSWAN_TIMELINE_MAX_WRITES_PER_QUANTUM = 512;
/** Validate and own an exact, one-pass WonderSwan register/RAM/Voice PCM trace.
 * Authored times are unsigned 44100-Hz sample positions, independent of clock.
 * @param {any} trace
 * @param {{sampleRate?:number}} [options] Actual output rate enables callback density validation.
 */
export declare function prepareWonderSwanTimeline(trace: any, { sampleRate }?: {
    sampleRate?: number;
}): {
    version: number;
    clock: number;
    durationSamples: any;
    events: any;
    pcmData: Uint8Array<any>;
};
/** Compact, allocation-free playback traversal of an already prepared trace.
 * advance() applies every write due at the requested output frame in source
 * order; values at a fractional boundary take effect on the following frame.
 */
export declare function createWonderSwanTimelineCursor(prepared: any, sampleRate: any): {
    durationFrames: number;
    nextFrame: () => number;
    advance(frame: any, apply: any): void;
};

export declare const AY_TIMED_STATE_FORMAT = "tetorica-ay8910-state";
export declare const AY_TIMED_STATE_VERSION = 1;
/** A detached register/control snapshot, not an audio-engine save state. */
/** @param {any} state
 * @param {{instanceId: string | number, clock: number, type?: number, flags?: number, frame: number, sampleRate: number}} [options]
 */
export declare function createAyTimedSnapshot(state: any, { instanceId, clock, type, flags, frame, sampleRate }?: {
    instanceId: string | number;
    clock: number;
    type?: number;
    flags?: number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: "tetorica-ay8910-state";
    version: 1;
    instanceId: string | number;
    clock: number;
    type: number;
    flags: number;
    registers: any[];
    levels: any[];
    frame: number;
    sampleRate: number;
}>;
/** Validate provenance/configuration and return a new independently owned value. */
export declare function validateAyTimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: "tetorica-ay8910-state";
    version: 1;
    instanceId: string | number;
    clock: number;
    type: number;
    flags: number;
    registers: any[];
    levels: any[];
    frame: number;
    sampleRate: number;
}>;

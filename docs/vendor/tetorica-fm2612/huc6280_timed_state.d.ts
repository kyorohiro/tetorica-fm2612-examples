export declare const HUC6280_TIMED_STATE_FORMAT = "tetorica-huc6280-state";
export declare const HUC6280_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId: string | number, frame: number, sampleRate: number}} [options]
 */
export declare function createHuc6280TimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: "tetorica-huc6280-state";
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: any;
        initialized: any;
        selectedChannel: any;
        globals: any[];
        registers: any;
        waveforms: any;
        indices: any[];
    }>;
}>;
export declare function validateHuc6280TimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: "tetorica-huc6280-state";
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: any;
        initialized: any;
        selectedChannel: any;
        globals: any[];
        registers: any;
        waveforms: any;
        indices: any[];
    }>;
}>;

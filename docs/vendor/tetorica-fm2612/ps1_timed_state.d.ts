export declare const PS1_TIMED_STATE_FORMAT = "tetorica-ps1-state";
export declare const PS1_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 */
export declare function createPs1TimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: "tetorica-ps1-state";
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        registers: any[];
        channels: any[];
        samples: any[];
        gates: any[];
        reverb: any;
        nextAddress: any;
    }>;
}>;
export declare function validatePs1TimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: "tetorica-ps1-state";
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        registers: any[];
        channels: any[];
        samples: any[];
        gates: any[];
        reverb: any;
        nextAddress: any;
    }>;
}>;

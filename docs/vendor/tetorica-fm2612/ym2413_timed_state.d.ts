export declare const OPLL_TIMED_STATE_FORMAT = "tetorica-opll-state";
export declare const OPLL_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 * @returns {Readonly<{format:'tetorica-opll-state',version:1,instanceId:string|number,frame:number,sampleRate:number,state:Readonly<{clock:number,registers:readonly number[]}>}>}
 */
export declare function createOpllTimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: 'tetorica-opll-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        registers: readonly number[];
    }>;
}>;
export declare function validateOpllTimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: 'tetorica-opll-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        registers: readonly number[];
    }>;
}>;

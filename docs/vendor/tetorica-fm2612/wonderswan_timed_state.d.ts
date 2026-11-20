export declare const WONDERSWAN_TIMED_STATE_FORMAT = "tetorica-wonderswan-state";
export declare const WONDERSWAN_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 * @returns {Readonly<{format:'tetorica-wonderswan-state',version:1,instanceId:string|number,frame:number,sampleRate:number,state:Readonly<{clock:number,initialized:boolean,registers:readonly number[],memory:readonly number[]}>}>}
 */
export declare function createWonderSwanTimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: 'tetorica-wonderswan-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        initialized: boolean;
        registers: readonly number[];
        memory: readonly number[];
    }>;
}>;
export declare function validateWonderSwanTimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: 'tetorica-wonderswan-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        initialized: boolean;
        registers: readonly number[];
        memory: readonly number[];
    }>;
}>;

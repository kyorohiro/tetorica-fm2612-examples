export declare const PSG_TIMED_STATE_FORMAT = "tetorica-psg-state";
export declare const PSG_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 * @returns {Readonly<{format:'tetorica-psg-state',version:1,instanceId:string|number,frame:number,sampleRate:number,state:Readonly<{clock:number,stereoEnabled:boolean,periods:readonly number[],attenuations:readonly number[],latched:number,noiseMode:number,stereo:number}>}>}
 */
export declare function createPsgTimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: 'tetorica-psg-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        stereoEnabled: boolean;
        periods: readonly number[];
        attenuations: readonly number[];
        latched: number;
        noiseMode: number;
        stereo: number;
    }>;
}>;
export declare function validatePsgTimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: 'tetorica-psg-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        stereoEnabled: boolean;
        periods: readonly number[];
        attenuations: readonly number[];
        latched: number;
        noiseMode: number;
        stereo: number;
    }>;
}>;

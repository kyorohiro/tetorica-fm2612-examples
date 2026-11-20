export declare const GAMEBOY_TIMED_STATE_FORMAT = "tetorica-gameboy-state";
export declare const GAMEBOY_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state, not an oscillator/audio save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 * @returns {Readonly<{format:'tetorica-gameboy-state',version:1,instanceId:string|number,frame:number,sampleRate:number,state:Readonly<{clock:number,initialized:boolean,registers:readonly number[],voice:readonly number[]}>}>}
 */
export declare function createGameboyTimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): Readonly<{
    format: 'tetorica-gameboy-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        initialized: boolean;
        registers: readonly number[];
        voice: readonly number[];
    }>;
}>;
export declare function validateGameboyTimedSnapshot(snapshot: any, expected?: {}): Readonly<{
    format: 'tetorica-gameboy-state';
    version: 1;
    instanceId: string | number;
    frame: number;
    sampleRate: number;
    state: Readonly<{
        clock: number;
        initialized: boolean;
        registers: readonly number[];
        voice: readonly number[];
    }>;
}>;

export type GameboyTimedApi = {
    build: typeof import('./gameboy_operations.js').buildGameboyOperations;
    captureState: () => Promise<ReturnType<typeof import('./gameboy_timed_state.js').createGameboyTimedSnapshot>>;
    compile: (operations: ReturnType<GameboyTimedApi['build']>, options?: {
        initialState?: 'current' | 'client' | 'reset' | Awaited<ReturnType<GameboyTimedApi['captureState']>>;
    }) => Promise<ReturnType<typeof import('./gameboy_operations.js').compileGameboyOperations>>;
    schedule: (operations: ReturnType<GameboyTimedApi['build']>, options: {
        name: string;
        repeatSeconds?: number;
    }) => Promise<{
        name: string;
        entries: number;
        sampleRate: number;
        startFrame?: number;
        repeatSeconds?: number;
        staged?: boolean;
    }>;
    clearSchedule: (name: string) => Promise<boolean>;
};
/** Attach the additive Game Boy API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics. */
/**
 * @typedef {Object} GameboyTimedApi
 * @property {typeof import('./gameboy_operations.js').buildGameboyOperations} build
 * @property {()=>Promise<ReturnType<typeof import('./gameboy_timed_state.js').createGameboyTimedSnapshot>>} captureState
 * @property {(operations:ReturnType<GameboyTimedApi['build']>,options?:{initialState?:'current'|'client'|'reset'|Awaited<ReturnType<GameboyTimedApi['captureState']>>})=>Promise<ReturnType<typeof import('./gameboy_operations.js').compileGameboyOperations>>} compile
 * @property {(operations:ReturnType<GameboyTimedApi['build']>,options:{name:string,repeatSeconds?:number})=>Promise<{name:string,entries:number,sampleRate:number,startFrame?:number,repeatSeconds?:number,staged?:boolean}>} schedule
 * @property {(name:string)=>Promise<boolean>} clearSchedule
 */
/** @template T
 * @param {T} api
 * @param {{instanceId?:string|number,native?:boolean,getClientState?:()=>any,validatePlan?:(program:any,state:any)=>unknown}} [configuration]
 * @param {any} [port]
 * @returns {T & GameboyTimedApi}
 */
export declare function attachGameboyTimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    native?: boolean;
    getClientState?: () => any;
    validatePlan?: (program: any, state: any) => unknown;
}, port?: any): T & GameboyTimedApi;

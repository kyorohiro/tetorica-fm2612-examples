export type PsgTimedApi = {
    build: typeof import('./segapsg_operations.js').buildPsgOperations;
    captureState: () => Promise<ReturnType<typeof import('./segapsg_timed_state.js').createPsgTimedSnapshot>>;
    compile: (operations: ReturnType<PsgTimedApi['build']>, options?: {
        initialState?: 'current' | 'client' | 'reset' | Awaited<ReturnType<PsgTimedApi['captureState']>>;
    }) => Promise<ReturnType<typeof import('./segapsg_operations.js').compilePsgOperations>>;
    schedule: (operations: ReturnType<PsgTimedApi['build']>, options: {
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
/** Attach the additive live PSG API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics. */
/**
 * @typedef {Object} PsgTimedApi
 * @property {typeof import('./segapsg_operations.js').buildPsgOperations} build
 * @property {()=>Promise<ReturnType<typeof import('./segapsg_timed_state.js').createPsgTimedSnapshot>>} captureState
 * @property {(operations:ReturnType<PsgTimedApi['build']>,options?:{initialState?:'current'|'client'|'reset'|Awaited<ReturnType<PsgTimedApi['captureState']>>})=>Promise<ReturnType<typeof import('./segapsg_operations.js').compilePsgOperations>>} compile
 * @property {(operations:ReturnType<PsgTimedApi['build']>,options:{name:string,repeatSeconds?:number})=>Promise<{name:string,entries:number,sampleRate:number,startFrame?:number,repeatSeconds?:number,staged?:boolean}>} schedule
 * @property {(name:string)=>Promise<boolean>} clearSchedule
 */
/** @template T
 * @param {T} api
 * @param {any} [configuration]
 * @param {any} [port]
 * @returns {T & PsgTimedApi}
 */
export declare function attachPsgTimedClient<T>(api: T, configuration?: any, port?: any): T & PsgTimedApi;

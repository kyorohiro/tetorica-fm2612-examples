export type WonderSwanTimedApi = {
    build: typeof import('./wonderswan_operations.js').buildWonderSwanOperations;
    captureState: () => Promise<ReturnType<typeof import('./wonderswan_timed_state.js').createWonderSwanTimedSnapshot>>;
    compile: (operations: ReturnType<WonderSwanTimedApi['build']>, options?: {
        initialState?: 'current' | 'client' | 'reset' | Awaited<ReturnType<WonderSwanTimedApi['captureState']>>;
    }) => Promise<ReturnType<typeof import('./wonderswan_operations.js').compileWonderSwanOperations>>;
    schedule: (operations: ReturnType<WonderSwanTimedApi['build']>, options: {
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
/** Attach the additive live WONDERSWAN API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics. */
/**
 * @typedef {Object} WonderSwanTimedApi
 * @property {typeof import('./wonderswan_operations.js').buildWonderSwanOperations} build
 * @property {()=>Promise<ReturnType<typeof import('./wonderswan_timed_state.js').createWonderSwanTimedSnapshot>>} captureState
 * @property {(operations:ReturnType<WonderSwanTimedApi['build']>,options?:{initialState?:'current'|'client'|'reset'|Awaited<ReturnType<WonderSwanTimedApi['captureState']>>})=>Promise<ReturnType<typeof import('./wonderswan_operations.js').compileWonderSwanOperations>>} compile
 * @property {(operations:ReturnType<WonderSwanTimedApi['build']>,options:{name:string,repeatSeconds?:number})=>Promise<{name:string,entries:number,sampleRate:number,startFrame?:number,repeatSeconds?:number,staged?:boolean}>} schedule
 * @property {(name:string)=>Promise<boolean>} clearSchedule
 */
/** @template T
 * @param {T} api
 * @param {{instanceId?:string|number,native?:boolean}} [configuration]
 * @param {any} [port]
 * @returns {T & WonderSwanTimedApi}
 */
export declare function attachWonderSwanTimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    native?: boolean;
}, port?: any): T & WonderSwanTimedApi;

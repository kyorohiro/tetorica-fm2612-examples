export type OpllTimedApi = {
    build: typeof import('./ym2413_operations.js').buildOpllOperations;
    captureState: () => Promise<ReturnType<typeof import('./ym2413_timed_state.js').createOpllTimedSnapshot>>;
    compile: (operations: ReturnType<OpllTimedApi['build']>, options?: {
        initialState?: 'current' | 'client' | 'reset' | Awaited<ReturnType<OpllTimedApi['captureState']>>;
    }) => Promise<ReturnType<typeof import('./ym2413_operations.js').compileOpllOperations>>;
    schedule: (operations: ReturnType<OpllTimedApi['build']>, options: {
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
/** Attach the additive live OPLL API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics. */
/**
 * @typedef {Object} OpllTimedApi
 * @property {typeof import('./ym2413_operations.js').buildOpllOperations} build
 * @property {()=>Promise<ReturnType<typeof import('./ym2413_timed_state.js').createOpllTimedSnapshot>>} captureState
 * @property {(operations:ReturnType<OpllTimedApi['build']>,options?:{initialState?:'current'|'client'|'reset'|Awaited<ReturnType<OpllTimedApi['captureState']>>})=>Promise<ReturnType<typeof import('./ym2413_operations.js').compileOpllOperations>>} compile
 * @property {(operations:ReturnType<OpllTimedApi['build']>,options:{name:string,repeatSeconds?:number})=>Promise<{name:string,entries:number,sampleRate:number,startFrame?:number,repeatSeconds?:number,staged?:boolean}>} schedule
 * @property {(name:string)=>Promise<boolean>} clearSchedule
 */
/** @template T
 * @param {T} api
 * @param {any} [configuration]
 * @param {any} [port]
 * @returns {T & OpllTimedApi}
 */
export declare function attachOpllTimedClient<T>(api: T, configuration?: any, port?: any): T & OpllTimedApi;

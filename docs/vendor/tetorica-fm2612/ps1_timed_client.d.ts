/** Attach the additive live PS1 API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics. */
/** @template T
 * @param {T} api
 * @param {any} [configuration]
 * @param {any} [port]
 * @returns {T & {build:typeof import('./ps1_operations.js').buildPs1Operations,captureState:()=>Promise<ReturnType<typeof import('./ps1_timed_state.js').createPs1TimedSnapshot>>,compile:(operations:any,options?:any)=>Promise<any[]>,schedule:(operations:any,options:any)=>Promise<any>,clearSchedule:(name:string)=>Promise<boolean>}}
 */
export declare function attachPs1TimedClient<T>(api: T, configuration?: any, port?: any): T & {
    build: typeof import('./ps1_operations.js').buildPs1Operations;
    captureState: () => Promise<ReturnType<typeof import('./ps1_timed_state.js').createPs1TimedSnapshot>>;
    compile: (operations: any, options?: any) => Promise<any[]>;
    schedule: (operations: any, options: any) => Promise<any>;
    clearSchedule: (name: string) => Promise<boolean>;
};

/** Immediate ordered commands, shared by main-thread and Worker runtimes.
 * @param {MessagePort} port
 * @param {{clock?:number,stereoEnabled?:boolean,native?:boolean,instanceId?:string|number}} [options] */
/** @param {any} port
 * @param {{clock?:number,stereoEnabled?:boolean,native?:boolean,instanceId?:string|number}} [options]
 * @returns {ReturnType<typeof import('./segapsg_api.js').createSegaPsgApi> & import('./segapsg_timed_client.js').PsgTimedApi & {readonly clock:number,readonly stereoEnabled:boolean,setClock(hz:number):Promise<unknown>}}
 */
export declare function createSegaPsgClient(port: any, options?: {
    clock?: number;
    stereoEnabled?: boolean;
    native?: boolean;
    instanceId?: string | number;
}): ReturnType<typeof import('./segapsg_api.js').createSegaPsgApi> & import('./segapsg_timed_client.js').PsgTimedApi & {
    readonly clock: number;
    readonly stereoEnabled: boolean;
    setClock(hz: number): Promise<unknown>;
};

/** Same immediate, ordered port writes for both raw and high-level APIs. */
/** @param {MessagePort} port */
/** @param {any} port
 * @param {{clock?:number,instanceId?:string|number,native?:boolean,primary?:boolean}} [options]
 * @param {any} [lifecycle]
 * @returns {import('./gameboysynth.js').GameboySynth & import('./gameboy_timed_client.js').GameboyTimedApi & {setClock(hz:number):Promise<unknown>}}
 */
export declare function createGameboyClient(port: any, options?: {
    clock?: number;
    instanceId?: string | number;
    native?: boolean;
    primary?: boolean;
}, lifecycle?: any): import('./gameboysynth.js').GameboySynth & import('./gameboy_timed_client.js').GameboyTimedApi & {
    setClock(hz: number): Promise<unknown>;
};
/** Safe builtin controls borrow the primary device, whose lifetime belongs to the runtime. */
/** @param {any} raw
 * @returns {Omit<ReturnType<typeof createGameboyClient>,'dispose'> & {readonly id:string}}
 */
export declare function createPrimaryGameboyApi(raw: any): Omit<ReturnType<typeof createGameboyClient>, 'dispose'> & {
    readonly id: string;
};

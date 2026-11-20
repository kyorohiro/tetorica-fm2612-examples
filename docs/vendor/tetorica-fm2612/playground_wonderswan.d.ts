/** Immediate, ordered register/RAM commands shared by Main and Worker runtimes.
 * This client keeps authored state; it does not read advancing core registers.
 * @param {MessagePort} port @param {{clock?:number,instanceId?:string|number,native?:boolean}} [options]
 */
/** @param {any} port
 * @param {{clock?:number,instanceId?:string|number,native?:boolean}} [options]
 * @param {any} [lifecycle]
 * @returns {import('./wonderswansynth.js').WonderSwanSynth & import('./wonderswan_timed_client.js').WonderSwanTimedApi & {setClock(hz:number):Promise<unknown>}}
 */
export declare function createWonderSwanClient(port: any, options?: {
    clock?: number;
    instanceId?: string | number;
    native?: boolean;
}, lifecycle?: any): import('./wonderswansynth.js').WonderSwanSynth & import('./wonderswan_timed_client.js').WonderSwanTimedApi & {
    setClock(hz: number): Promise<unknown>;
};
/** Builtin controls borrow the primary device; the runtime owns its lifetime. */
/** @param {any} raw
 * @returns {Omit<ReturnType<typeof createWonderSwanClient>,'dispose'> & {readonly id:string}}
 */
export declare function createPrimaryWonderSwanApi(raw: any): Omit<ReturnType<typeof createWonderSwanClient>, 'dispose'> & {
    readonly id: string;
};

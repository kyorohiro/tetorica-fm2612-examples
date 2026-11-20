/** Immediate, ordered register commands shared by Main and Worker runtimes.
 * @param {MessagePort} port
 * @param {{clock?:number}} [options] */
export declare function createHuc6280Client(port: MessagePort, options?: {
    clock?: number;
}, lifecycle?: {}): any;
/** Builtin controls borrow the primary device; the runtime owns its lifetime. */
export declare function createPrimaryHuc6280Api(raw: any): {
    setClock: (...args: any[]) => any;
    readonly _timedOperations: any;
};

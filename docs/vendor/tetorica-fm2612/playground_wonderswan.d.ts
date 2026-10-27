import { WonderSwanSynth } from './wonderswansynth.js';
/** Immediate, ordered register/RAM commands shared by Main and Worker runtimes.
 * This client keeps authored state; it does not read advancing core registers.
 * @param {MessagePort} port @param {{clock?:number}} [options]
 */
export declare function createWonderSwanClient(port: MessagePort, options?: {
    clock?: number;
}, lifecycle?: {}): WonderSwanSynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};
/** Builtin controls borrow the primary device; the runtime owns its lifetime. */
export declare function createPrimaryWonderSwanApi(raw: any): {
    setClock: (...args: any[]) => any;
};

import { YM2413Synth } from './ym2413synth.js';
/** Register-authoring controls shared by Main and Worker. Adoption never writes audio.
 * @param {MessagePort} port @param {{clock?:number}} [options] */
export declare function createYm2413Client(port: MessagePort, { clock }?: {
    clock?: number;
}): YM2413Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

import { AY8910Synth } from './ay8910synth.js';
/** Register-authoring controls. Adopting a Main/Worker snapshot never writes audio.
 * @param {MessagePort} port @param {{clock?:number}} [options] */
export declare function createAy8910Client(port: MessagePort, { clock }?: {
    clock?: number;
}): AY8910Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

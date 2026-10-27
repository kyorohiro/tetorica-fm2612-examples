import { AY8910Synth } from './ay8910synth.js';
/** Register-authoring controls. Adopting a Main/Worker snapshot never writes audio.
 * @param {(method:string,args:unknown[])=>unknown} send
 * @param {{clock?:number,close?:()=>void,request?:(method:string,args:unknown[])=>unknown}} [options] */
export declare function createAy8910RegisterClient(send: (method: string, args: unknown[]) => unknown, { clock, close, request }?: {
    clock?: number;
    close?: () => void;
    request?: (method: string, args: unknown[]) => unknown;
}): AY8910Synth;
export declare function createAy8910Client(port: any, options?: {}, lifecycle?: {}): AY8910Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};

import { YM2413Synth } from './ym2413synth.js';
/** Register-authoring controls shared by Main and Worker. Adoption never writes audio.
 * @param {(method:string,args:unknown[],metadata?:{intentMask:number})=>unknown} send
 * @param {{clock?:number,close?:()=>void,request?:(method:string,args:unknown[])=>unknown}} [options] */
export declare function createYm2413RegisterClient(send: (method: string, args: unknown[], metadata?: {
    intentMask: number;
}) => unknown, { clock, close, request }?: {
    clock?: number;
    close?: () => void;
    request?: (method: string, args: unknown[]) => unknown;
}): YM2413Synth;
export declare function createYm2413Client(port: any, options?: {}, lifecycle?: {}): YM2413Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

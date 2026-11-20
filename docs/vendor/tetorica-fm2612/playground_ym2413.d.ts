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
/** @param {any} port
 * @param {{clock?:number,native?:boolean,state?:any,instanceId?:string|number}} [options]
 * @param {any} [lifecycle]
 * @returns {import('./ym2413synth.js').YM2413Synth & import('./ym2413_timed_client.js').OpllTimedApi & {readonly clock:number,setClock(hz:number):Promise<unknown>}}
 */
export declare function createYm2413Client(port: any, options?: {
    clock?: number;
    native?: boolean;
    state?: any;
    instanceId?: string | number;
}, lifecycle?: any): import('./ym2413synth.js').YM2413Synth & import('./ym2413_timed_client.js').OpllTimedApi & {
    readonly clock: number;
    setClock(hz: number): Promise<unknown>;
};

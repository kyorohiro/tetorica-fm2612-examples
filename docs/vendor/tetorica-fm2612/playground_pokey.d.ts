import { PokeySynth } from './pokeysynth.js';
/** Applied snapshots are adopted without replaying register writes.
 * @param {(method:string,args:any[],channel?:number)=>void} send
 * @param {{clock?:number,close?:()=>void,request?:(method:string,args?:any[])=>Promise<any>,native?:boolean,lifecycle?:any,chunkedTimeline?:boolean}} [options] */
export declare function createPokeyRegisterClient(send: (method: string, args: any[], channel?: number) => void, { clock, close, request, native, lifecycle, chunkedTimeline }?: {
    clock?: number;
    close?: () => void;
    request?: (method: string, args?: any[]) => Promise<any>;
    native?: boolean;
    lifecycle?: any;
    chunkedTimeline?: boolean;
}): PokeySynth;
export declare function createPokeyClient(port: any, options?: {}, lifecycle?: {}): PokeySynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};

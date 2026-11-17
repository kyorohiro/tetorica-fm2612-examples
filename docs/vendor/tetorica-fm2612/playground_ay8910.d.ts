import { AY8910Synth } from './ay8910synth.js';
/** Register-authoring controls. Adopting a Main/Worker snapshot never writes audio.
 * @param {(method:string,args:unknown[])=>unknown} send
 * @param {{clock?:number,close?:()=>void,request?:(method:string,args:unknown[])=>unknown,sendBatch?:(commands:any[])=>void}} [options] */
export declare function createAy8910RegisterClient(send: (method: string, args: unknown[]) => unknown, { clock, close, request, sendBatch }?: {
    clock?: number;
    close?: () => void;
    request?: (method: string, args: unknown[]) => unknown;
    sendBatch?: (commands: any[]) => void;
}): AY8910Synth;
export declare function createAy8910Client(port: any, options?: {}, lifecycle?: {}): any;

import { OPLSynth } from './opl_synth.js';
export declare const OPL_CHIPS: readonly string[];
/** A register-authoring client; Main and Worker use the same Synth and shadow.
 * Construction and adoption never replay registers into the audio processor.
 * @param {(method:string,args:unknown[],metadata?:{intentMask:number})=>unknown} send
 * @param {{chip?:import('./opl_synth.js').OPLChip,clock?:number,close?:()=>void,
 * request?:(method:string,args:unknown[],scope?:unknown)=>unknown,owner?:()=>unknown,
 * adpcmContext?:import('./y8950_adpcm.js').Y8950AdpcmLifecycle}} [options] */
export declare function createOplRegisterClient(send: (method: string, args: unknown[], metadata?: {
    intentMask: number;
}) => unknown, { chip, clock, close, request, owner, adpcmContext }?: {
    chip?: import('./opl_synth.js').OPLChip;
    clock?: number;
    close?: () => void;
    request?: (method: string, args: unknown[], scope?: unknown) => unknown;
    owner?: () => unknown;
    adpcmContext?: import('./y8950_adpcm.js').Y8950AdpcmLifecycle;
}): OPLSynth;
/** Merge an inspector edit into this author's current image, without sending
 * controls or replacing unrelated future writes with an applied snapshot. */
export declare function stageOplAuthorEdit(state: any, method: any, args: any, effectiveFourOpMask?: any): any;
export declare function createOplClient(port: any, options?: {}, lifecycle?: {}): OPLSynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};

import { OPLSynth } from './opl_synth.js';
export declare const OPL_CHIPS: readonly string[];
/** A register-authoring client; Main and Worker use the same Synth and shadow.
 * Construction and adoption never replay registers into the audio processor.
 * @param {MessagePort} port
 * @param {{chip?:'ym3526'|'ym3812'|'y8950'|'ymf262',clock?:number}} [options] */
export declare function createOplClient(port: MessagePort, { chip, clock }?: {
    chip?: 'ym3526' | 'ym3812' | 'y8950' | 'ymf262';
    clock?: number;
}): OPLSynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

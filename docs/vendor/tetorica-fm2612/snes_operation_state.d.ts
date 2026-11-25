import { SnesSynth } from './snessynth.js';
/** Plain bounded metadata copy, available in AudioWorkletGlobalScope. */
export declare function cloneSnesOperationData(value: any, seen?: Set<any>, depth?: number): any;
export type SnesOperationState = ReturnType<SnesSynth['getState']> & {
    clock: number;
    registers: number[];
    nativeFrames: number;
    pendingKon: number;
    konFrame: number;
    koff: number;
};
/** @typedef {ReturnType<SnesSynth['getState']> & {clock:number,registers:number[],nativeFrames:number,pendingKon:number,konFrame:number,koff:number}} SnesOperationState */
/** Capture only operation-resolution metadata, never RAM, envelopes or decoder phase. */
export declare function captureSnesOperationState(synth: any): any;
export declare function createSnesOperationResetState({ clock }?: {
    clock?: number | undefined;
}): any;
/** Detached validated state; sample records contain tuning/addresses, not bytes. */
export declare function validateSnesOperationState(state: any): any;

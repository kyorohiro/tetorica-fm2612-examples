export type NESOperationState = import('./nes_operation_state.js').NesOperationState;
export type NESSnapshotConfiguration = {
    instanceId: string | number;
    clock: number;
    engine?: 'nes-wasm';
    frame: number;
    sampleRate: number;
};
export type NESTimedSnapshot = Readonly<NESOperationState & {
    format: 'tetorica-nes-state';
    version: 1;
    instanceId: string | number;
    clock: number;
    engine: 'nes-wasm';
    frame: number;
    sampleRate: number;
}>;
/** @typedef {import('./nes_operation_state.js').NesOperationState} NESOperationState */
/** @typedef {{instanceId:string|number,clock:number,engine?:'nes-wasm',frame:number,sampleRate:number}} NESSnapshotConfiguration */
/** @typedef {Readonly<NESOperationState & {format:'tetorica-nes-state',version:1,instanceId:string|number,clock:number,engine:'nes-wasm',frame:number,sampleRate:number}>} NESTimedSnapshot */
export declare const NES_TIMED_STATE_FORMAT = "tetorica-nes-state";
export declare const NES_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state. It does not restore oscillator phases,
 * envelopes or an audio engine; capture and compilation never stop playback.
 * @param {NESOperationState} state
 * @param {NESSnapshotConfiguration} configuration
 * @returns {NESTimedSnapshot} */
export declare function createNesTimedSnapshot(state: NESOperationState, { instanceId, clock, engine, frame, sampleRate }?: NESSnapshotConfiguration): NESTimedSnapshot;
/** Reject incompatible provenance/configuration and return independent data.
 * @param {unknown} snapshot
 * @param {{instanceId?:string|number,clock?:number,engine?:'nes-wasm'}} [expected]
 * @returns {NESTimedSnapshot} */
export declare function validateNesTimedSnapshot(snapshot: unknown, expected?: {
    instanceId?: string | number;
    clock?: number;
    engine?: 'nes-wasm';
}): NESTimedSnapshot;

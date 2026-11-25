export type SNESOperationState = import('./snes_operation_state.js').SnesOperationState;
export type SNESSnapshotConfiguration = {
    instanceId: string | number;
    clock: number;
    engine?: 'snes-wasm';
    frame: number;
    sampleRate: number;
};
export type SNESTimedSnapshot = Readonly<SNESOperationState & {
    format: 'tetorica-snes-state';
    version: 1;
    instanceId: string | number;
    clock: number;
    engine: 'snes-wasm';
    frame: number;
    sampleRate: number;
}>;
/** @typedef {import('./snes_operation_state.js').SnesOperationState} SNESOperationState */
/** @typedef {{instanceId:string|number,clock:number,engine?:'snes-wasm',frame:number,sampleRate:number}} SNESSnapshotConfiguration */
/** @typedef {Readonly<SNESOperationState & {format:'tetorica-snes-state',version:1,instanceId:string|number,clock:number,engine:'snes-wasm',frame:number,sampleRate:number}>} SNESTimedSnapshot */
export declare const SNES_TIMED_STATE_FORMAT = "tetorica-snes-state";
export declare const SNES_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state. It does not restore oscillator phases,
 * envelopes or an audio engine; capture and compilation never stop playback.
 * @param {SNESOperationState} state
 * @param {SNESSnapshotConfiguration} configuration
 * @returns {SNESTimedSnapshot} */
export declare function createSnesTimedSnapshot(state: SNESOperationState, { instanceId, clock, engine, frame, sampleRate }?: SNESSnapshotConfiguration): SNESTimedSnapshot;
/** Reject incompatible provenance/configuration and return independent data.
 * @param {unknown} snapshot
 * @param {{instanceId?:string|number,clock?:number,engine?:'snes-wasm'}} [expected]
 * @returns {SNESTimedSnapshot} */
export declare function validateSnesTimedSnapshot(snapshot: unknown, expected?: {
    instanceId?: string | number;
    clock?: number;
    engine?: 'snes-wasm';
}): SNESTimedSnapshot;

export type YM2608OperationState = import('./ym2608_operation_state.js').YM2608OperationState;
export type YM2608SnapshotConfiguration = {
    instanceId: string | number;
    clock: number;
    engine?: 'ymfm';
    frame: number;
    sampleRate: number;
};
export type YM2608TimedSnapshot = Readonly<YM2608OperationState & {
    format: 'tetorica-ym2608-state';
    version: 1;
    instanceId: string | number;
    clock: number;
    engine: 'ymfm';
    frame: number;
    sampleRate: number;
}>;
/** @typedef {import('./ym2608_operation_state.js').YM2608OperationState} YM2608OperationState */
/** @typedef {{instanceId:string|number,clock:number,engine?:'ymfm',frame:number,sampleRate:number}} YM2608SnapshotConfiguration */
/** @typedef {Readonly<YM2608OperationState & {format:'tetorica-ym2608-state',version:1,instanceId:string|number,clock:number,engine:'ymfm',frame:number,sampleRate:number}>} YM2608TimedSnapshot */
export declare const YM2608_TIMED_STATE_FORMAT = "tetorica-ym2608-state";
export declare const YM2608_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state. It does not restore oscillator phases,
 * envelopes or an audio engine; capture and compilation never stop playback.
 * @param {YM2608OperationState} state
 * @param {YM2608SnapshotConfiguration} configuration
 * @returns {YM2608TimedSnapshot} */
export declare function createYm2608TimedSnapshot(state: YM2608OperationState, { instanceId, clock, engine, frame, sampleRate }?: YM2608SnapshotConfiguration): YM2608TimedSnapshot;
/** Reject incompatible provenance/configuration and return independent data.
 * @param {unknown} snapshot
 * @param {{instanceId?:string|number,clock?:number,engine?:'ymfm'}} [expected]
 * @returns {YM2608TimedSnapshot} */
export declare function validateYm2608TimedSnapshot(snapshot: unknown, expected?: {
    instanceId?: string | number;
    clock?: number;
    engine?: 'ymfm';
}): YM2608TimedSnapshot;

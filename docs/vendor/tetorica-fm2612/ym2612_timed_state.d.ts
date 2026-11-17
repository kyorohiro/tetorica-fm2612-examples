export type YM2612OperationState = import('./ym2612_operation_state.js').YM2612OperationState;
export type YM2612SnapshotConfiguration = {
    instanceId: string | number;
    clock: number;
    engine?: 'ymfm' | 'nuked';
    frame: number;
    sampleRate: number;
};
export type YM2612TimedSnapshot = Readonly<YM2612OperationState & {
    format: 'tetorica-ym2612-state';
    version: 1;
    instanceId: string | number;
    clock: number;
    engine: 'ymfm' | 'nuked';
    frame: number;
    sampleRate: number;
}>;
/** @typedef {import('./ym2612_operation_state.js').YM2612OperationState} YM2612OperationState */
/** @typedef {{instanceId:string|number,clock:number,engine?:'ymfm'|'nuked',frame:number,sampleRate:number}} YM2612SnapshotConfiguration */
/** @typedef {Readonly<YM2612OperationState & {format:'tetorica-ym2612-state',version:1,instanceId:string|number,clock:number,engine:'ymfm'|'nuked',frame:number,sampleRate:number}>} YM2612TimedSnapshot */
export declare const YM2612_TIMED_STATE_FORMAT = "tetorica-ym2612-state";
export declare const YM2612_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution state. It does not restore oscillator phases,
 * envelopes or an audio engine; capture and compilation never stop playback.
 * @param {YM2612OperationState} state
 * @param {YM2612SnapshotConfiguration} configuration
 * @returns {YM2612TimedSnapshot} */
export declare function createYm2612TimedSnapshot(state: YM2612OperationState, { instanceId, clock, engine, frame, sampleRate }?: YM2612SnapshotConfiguration): YM2612TimedSnapshot;
/** Reject incompatible provenance/configuration and return independent data.
 * @param {unknown} snapshot
 * @param {{instanceId?:string|number,clock?:number,engine?:'ymfm'|'nuked'}} [expected]
 * @returns {YM2612TimedSnapshot} */
export declare function validateYm2612TimedSnapshot(snapshot: unknown, expected?: {
    instanceId?: string | number;
    clock?: number;
    engine?: 'ymfm' | 'nuked';
}): YM2612TimedSnapshot;

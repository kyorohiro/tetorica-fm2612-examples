export type YM2612OperationRecorder = import('./ym2612_operations.js').YM2612OperationRecorder;
export type YM2612OperationProgram = import('./ym2612_operations.js').YM2612OperationProgram;
export type YM2612BuildOptions = import('./ym2612_operations.js').YM2612BuildOptions;
export type YM2612CompiledWrite = import('./ym2612_operations.js').YM2612CompiledWrite;
export type YM2612StateSnapshot = import('./ym2612_timed_state.js').YM2612TimedSnapshot;
export type YM2612CompileOptions = {
    initialState?: 'current' | 'client' | 'reset' | YM2612StateSnapshot;
};
export type YM2612ScheduleOptions = {
    name: string;
    repeatSeconds?: number;
};
export type YM2612ScheduleReceipt = {
    name: string;
    startFrame?: number;
    sampleRate: number;
    entries: number;
    repeatSeconds?: number;
    staged?: boolean;
};
export type YM2612TimedApi = {
    build(callback: (recorder: YM2612OperationRecorder) => void | YM2612OperationRecorder, options?: YM2612BuildOptions): YM2612OperationProgram;
    compile(operations: YM2612OperationProgram, options?: YM2612CompileOptions): Promise<YM2612CompiledWrite[]>;
    captureState(): Promise<YM2612StateSnapshot>;
    schedule(operations: YM2612OperationProgram, options: YM2612ScheduleOptions): Promise<YM2612ScheduleReceipt>;
    clearSchedule(name: string): Promise<boolean>;
    dispose(): void;
};
/** Attach the additive live YM2612 API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics.
 * The client baseline is optimistic: it excludes renderer-only scheduled edits.
 * This also supports an explicit `new YM2612Synth({transport})` integration;
 * pass its AudioWorklet MessagePort as the third argument.
 * @template T
 * @param {T} api
 * @param {{instanceId?:string|number,engine?:'ymfm'|'nuked',native?:boolean}} [configuration]
 * @param {MessagePort} [port]
 * @returns {T & YM2612TimedApi}
 */
export declare function attachYm2612TimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    engine?: 'ymfm' | 'nuked';
    native?: boolean;
}, port?: MessagePort): T & YM2612TimedApi;

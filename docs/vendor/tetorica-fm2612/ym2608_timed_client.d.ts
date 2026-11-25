export type YM2608OperationRecorder = import('./ym2608_operations.js').YM2608OperationRecorder;
export type YM2608OperationProgram = import('./ym2608_operations.js').YM2608OperationProgram;
export type YM2608BuildOptions = import('./ym2608_operations.js').YM2608BuildOptions;
export type YM2608CompiledWrite = import('./ym2608_operations.js').YM2608CompiledWrite;
export type YM2608StateSnapshot = import('./ym2608_timed_state.js').YM2608TimedSnapshot;
export type YM2608CompileOptions = {
    initialState?: 'current' | 'client' | 'reset' | YM2608StateSnapshot;
};
export type YM2608ScheduleOptions = {
    name: string;
    repeatSeconds?: number;
};
export type YM2608ScheduleReceipt = {
    name: string;
    startFrame?: number;
    sampleRate: number;
    entries: number;
    repeatSeconds?: number;
    staged?: boolean;
};
export type YM2608TimedApi = {
    build(callback: (recorder: YM2608OperationRecorder) => void | YM2608OperationRecorder, options?: YM2608BuildOptions): YM2608OperationProgram;
    compile(operations: YM2608OperationProgram, options?: YM2608CompileOptions): Promise<YM2608CompiledWrite[]>;
    captureState(): Promise<YM2608StateSnapshot>;
    schedule(operations: YM2608OperationProgram, options: YM2608ScheduleOptions): Promise<YM2608ScheduleReceipt>;
    clearSchedule(name: string): Promise<boolean>;
    dispose(): void;
};
/** Attach the additive live YM2608 API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics.
 * The client baseline is optimistic: it excludes renderer-only scheduled edits.
 * This also supports an explicit `new YM2608Synth({transport})` integration;
 * pass its AudioWorklet MessagePort as the third argument.
 * @template T
 * @param {T} api
 * @param {{instanceId?:string|number,engine?:'ymfm',native?:boolean}} [configuration]
 * @param {MessagePort} [port]
 * @returns {T & YM2608TimedApi}
 */
export declare function attachYm2608TimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    engine?: 'ymfm';
    native?: boolean;
}, port?: MessagePort): T & YM2608TimedApi;

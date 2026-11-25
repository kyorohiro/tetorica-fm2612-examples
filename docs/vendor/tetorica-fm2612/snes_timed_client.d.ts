export type SNESOperationRecorder = import('./snes_operations.js').SNESOperationRecorder;
export type SNESOperationProgram = import('./snes_operations.js').SNESOperationProgram;
export type SNESBuildOptions = import('./snes_operations.js').SNESBuildOptions;
export type SNESCompiledWrite = import('./snes_operations.js').SNESCompiledWrite;
export type SNESStateSnapshot = import('./snes_timed_state.js').SNESTimedSnapshot;
export type SNESCompileOptions = {
    initialState?: 'current' | 'client' | 'reset' | SNESStateSnapshot;
};
export type SNESScheduleOptions = {
    name: string;
    repeatSeconds?: number;
};
export type SNESScheduleReceipt = {
    name: string;
    startFrame?: number;
    sampleRate: number;
    entries: number;
    repeatSeconds?: number;
    staged?: boolean;
};
export type SNESTimedApi = {
    build(callback: (recorder: SNESOperationRecorder) => void | SNESOperationRecorder, options?: SNESBuildOptions): SNESOperationProgram;
    compile(operations: SNESOperationProgram, options?: SNESCompileOptions): Promise<SNESCompiledWrite[]>;
    captureState(): Promise<SNESStateSnapshot>;
    schedule(operations: SNESOperationProgram, options: SNESScheduleOptions): Promise<SNESScheduleReceipt>;
    clearSchedule(name: string): Promise<boolean>;
    dispose(): void;
};
/** Attach the additive live SNES API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics.
 * The client baseline is optimistic: it excludes renderer-only scheduled edits.
 * This also supports an explicit `new SNESSynth({transport})` integration;
 * pass its AudioWorklet MessagePort as the third argument.
 * @template T
 * @param {T} api
 * @param {{instanceId?:string|number,engine?:'snes-wasm',native?:boolean}} [configuration]
 * @param {MessagePort} [port]
 * @returns {T & SNESTimedApi}
 */
export declare function attachSnesTimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    engine?: 'snes-wasm';
    native?: boolean;
}, port?: MessagePort): T & SNESTimedApi;

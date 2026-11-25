export type NESOperationRecorder = import('./nes_operations.js').NESOperationRecorder;
export type NESOperationProgram = import('./nes_operations.js').NESOperationProgram;
export type NESBuildOptions = import('./nes_operations.js').NESBuildOptions;
export type NESCompiledWrite = import('./nes_operations.js').NESCompiledWrite;
export type NESStateSnapshot = import('./nes_timed_state.js').NESTimedSnapshot;
export type NESCompileOptions = {
    initialState?: 'current' | 'client' | 'reset' | NESStateSnapshot;
};
export type NESScheduleOptions = {
    name: string;
    repeatSeconds?: number;
};
export type NESScheduleReceipt = {
    name: string;
    startFrame?: number;
    sampleRate: number;
    entries: number;
    repeatSeconds?: number;
    staged?: boolean;
};
export type NESTimedApi = {
    build(callback: (recorder: NESOperationRecorder) => void | NESOperationRecorder, options?: NESBuildOptions): NESOperationProgram;
    compile(operations: NESOperationProgram, options?: NESCompileOptions): Promise<NESCompiledWrite[]>;
    captureState(): Promise<NESStateSnapshot>;
    schedule(operations: NESOperationProgram, options: NESScheduleOptions): Promise<NESScheduleReceipt>;
    clearSchedule(name: string): Promise<boolean>;
    dispose(): void;
};
/** Attach the additive live NES API after its acknowledged control transport.
 * Existing getters and immediate authoring methods retain their semantics.
 * The client baseline is optimistic: it excludes renderer-only scheduled edits.
 * This also supports an explicit `new NESSynth({transport})` integration;
 * pass its AudioWorklet MessagePort as the third argument.
 * @template T
 * @param {T} api
 * @param {{instanceId?:string|number,engine?:'nes-wasm',native?:boolean}} [configuration]
 * @param {MessagePort} [port]
 * @returns {T & NESTimedApi}
 */
export declare function attachNesTimedClient<T>(api: T, configuration?: {
    instanceId?: string | number;
    engine?: 'nes-wasm';
    native?: boolean;
}, port?: MessagePort): T & NESTimedApi;

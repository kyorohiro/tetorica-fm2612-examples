import { YM2612Synth } from './ym2612synth.js';
export { createYm2612OperationResetState, validateYm2612OperationState, observeYm2612OperationWrite } from './ym2612_operation_state.js';
export type YM2612OperationState = import('./ym2612_operation_state.js').YM2612OperationState;
export type YM2612RecordedMethod = 'write' | 'rawWrite' | 'setPreset' | 'setOperator' | 'setOperators' | 'setAlgo' | 'setPan' | 'setLfo' | 'setChannel3SpecialMode' | 'setChannel3SpecialFrequency' | 'setFrequency' | 'setNote' | 'setBlockFnum' | 'keyOn' | 'keyOff' | 'noteOn' | 'noteOnRaw' | 'noteOff' | 'setDacEnabled' | 'writeDac';
export type YM2612OperationTime = {
    unit: 'sample' | 'seconds';
    value: number;
};
export type YM2612TimedOperation = {
    time: YM2612OperationTime;
    order: number;
    method: YM2612RecordedMethod;
    args: unknown[];
};
export type YM2612OperationProgram = {
    version: 1;
    chip: 'ym2612';
    referenceSampleRate: number;
    operations: YM2612TimedOperation[];
};
export type YM2612BuildOptions = {
    referenceSampleRate?: number;
};
export type YM2612RegisterWrite = {
    port: number;
    register: number;
    value: number;
};
export type YM2612CompiledWrite = YM2612RegisterWrite & {
    offsetSeconds: number;
    operationIndex: number;
    writeIndex: number;
};
export type YM2612OperationRecorder = Omit<{
    [K in YM2612RecordedMethod]: (...args: Parameters<YM2612Synth[K]>) => YM2612OperationRecorder;
}, 'noteOn' | 'setFrequency'> & {
    atSample(value: number): YM2612OperationRecorder;
    atSeconds(value: number): YM2612OperationRecorder;
    noteOn(...args: [channel: number, note: string | number] | [channel: number, block: number, fnum: number]): YM2612OperationRecorder;
    setFrequency(...args: [channel: number, hz: number] | [channel: number, block: number, fnum: number]): YM2612OperationRecorder;
};
export declare const YM2612_OPERATION_METHODS: readonly string[];
export declare const MAX_YM2612_OPERATIONS = 4096;
/** @param {YM2612TimedOperation} operation @param {number} [referenceSampleRate]
 * @returns {number} */
export declare function ym2612OperationOffsetSeconds(operation: YM2612TimedOperation, referenceSampleRate?: number): number;
/** Record once. This function never constructs a chip or resolves register bytes.
 * Offsets are absolute from reservation start and independent of output rate.
 * @param {(builder:YM2612OperationRecorder)=>void} callback
 * @param {YM2612BuildOptions} [options] @returns {YM2612OperationProgram} */
export declare function buildYm2612Operations(callback: (builder: YM2612OperationRecorder) => void, options?: YM2612BuildOptions): YM2612OperationProgram;
/** A scratch chip shares existing parameter validation and register conversion.
 * State adoption and raw-shadow updates never touch the live SoundChip.
 * @param {{clock?:number}} [options]
 * @returns {{resolve(operation:YM2612TimedOperation,state:YM2612OperationState):{writes:YM2612RegisterWrite[],state:YM2612OperationState}}} */
export declare function createYm2612OperationResolver({ clock }?: {
    clock?: number;
}): {
    resolve(operation: YM2612TimedOperation, state: YM2612OperationState): {
        writes: YM2612RegisterWrite[];
        state: YM2612OperationState;
    };
};
/** Validate all calls using their shared existing conversion, without live state.
 * @param {YM2612OperationProgram} plan
 * @param {{clock?:number,validateArguments?:boolean}} [options]
 * @returns {YM2612OperationProgram} */
export declare function validateYm2612Operations(plan: YM2612OperationProgram, { clock, validateArguments }?: {
    clock?: number;
    validateArguments?: boolean;
}): YM2612OperationProgram;
/** Compile one virtual pass. Baseline adoption never contributes write rows.
 * @param {YM2612OperationProgram} plan @param {YM2612OperationState} state
 * @param {{clock?:number}} [options] @returns {YM2612CompiledWrite[]} */
export declare function compileYm2612Operations(plan: YM2612OperationProgram, state: YM2612OperationState, { clock }?: {
    clock?: number;
}): YM2612CompiledWrite[];

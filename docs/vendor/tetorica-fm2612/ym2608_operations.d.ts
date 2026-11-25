import { YM2608Synth } from './ym2608synth.js';
export { createYm2608OperationResetState, validateYm2608OperationState, observeYm2608OperationWrite } from './ym2608_operation_state.js';
export type YM2608OperationState = import('./ym2608_operation_state.js').YM2608OperationState;
export type YM2608RecordedMethod = typeof YM2608_OPERATION_METHODS[number];
export type YM2608OperationTime = {
    unit: 'sample' | 'seconds';
    value: number;
};
export type YM2608TimedOperation = {
    time: YM2608OperationTime;
    order: number;
    method: YM2608RecordedMethod;
    args: unknown[];
};
export type YM2608OperationProgram = {
    version: 1;
    chip: 'ym2608';
    referenceSampleRate: number;
    operations: YM2608TimedOperation[];
};
export type YM2608BuildOptions = {
    referenceSampleRate?: number;
};
export type YM2608RegisterWrite = {
    port: number;
    register: number;
    value: number;
};
export type YM2608CompiledWrite = YM2608RegisterWrite & {
    offsetSeconds: number;
    operationIndex: number;
    writeIndex: number;
};
export type YM2608FmRecordedMethod = 'write' | 'rawWrite' | 'setPreset' | 'setOperator' | 'setOperators' | 'setAlgo' | 'setPan' | 'setLfo' | 'setChannel3SpecialMode' | 'setChannel3SpecialFrequency' | 'setFrequency' | 'setNote' | 'setBlockFnum' | 'keyOn' | 'keyOff' | 'noteOn' | 'noteOnRaw' | 'noteOff' | 'setModulation';
export type YM2608SsgRecordedMethod = 'write' | 'tone' | 'noise' | 'setMixer' | 'setVolume' | 'setEnvelope' | 'setTonePeriod' | 'setFrequency' | 'setNote' | 'keyOn' | 'keyOff' | 'noteOn' | 'noteOff' | 'off';
export type YM2608AdpcmRecorder = {
    [K in 'setSample' | 'setDeltaN' | 'setPlaybackRate' | 'setVolume' | 'setPan' | 'keyOn' | 'keyOff']: (...args: Parameters<YM2608Synth['adpcm'][K]>) => YM2608OperationRecorder;
};
export type YM2608RhythmRecorder = {
    [K in 'setVolume' | 'setVoice' | 'keyOn' | 'keyOff']: (...args: Parameters<YM2608Synth['rhythm'][K]>) => YM2608OperationRecorder;
};
export type YM2608SsgRecorder = {
    [K in YM2608SsgRecordedMethod]: (...args: Parameters<YM2608Synth['ssg'][K]>) => YM2608OperationRecorder;
};
export type YM2608OperationRecorder = {
    [K in YM2608FmRecordedMethod]: (...args: Parameters<YM2608Synth[K]>) => YM2608OperationRecorder;
} & {
    atSample(value: number): YM2608OperationRecorder;
    atSeconds(value: number): YM2608OperationRecorder;
    rhythm: YM2608RhythmRecorder;
    adpcm: YM2608AdpcmRecorder;
    ssg: YM2608SsgRecorder;
};
export declare const YM2608_OPERATION_METHODS: readonly string[];
export declare const MAX_YM2608_OPERATIONS = 4096;
/** @param {YM2608TimedOperation} operation @param {number} [referenceSampleRate]
 * @returns {number} */
export declare function ym2608OperationOffsetSeconds(operation: YM2608TimedOperation, referenceSampleRate?: number): number;
/** Record once. This function never constructs a chip or resolves register bytes.
 * Offsets are absolute from reservation start and independent of output rate.
 * @param {(builder:YM2608OperationRecorder)=>void} callback
 * @param {YM2608BuildOptions} [options] @returns {YM2608OperationProgram} */
export declare function buildYm2608Operations(callback: (builder: YM2608OperationRecorder) => void, options?: YM2608BuildOptions): YM2608OperationProgram;
/** A scratch chip shares existing parameter validation and register conversion.
 * State adoption and raw-shadow updates never touch the live SoundChip.
 * @param {{clock?:number}} [options]
 * @returns {{resolve(operation:YM2608TimedOperation,state:YM2608OperationState):{writes:YM2608RegisterWrite[],state:YM2608OperationState}}} */
export declare function createYm2608OperationResolver({ clock }?: {
    clock?: number;
}): {
    resolve(operation: YM2608TimedOperation, state: YM2608OperationState): {
        writes: YM2608RegisterWrite[];
        state: YM2608OperationState;
    };
};
/** Validate all calls using their shared existing conversion, without live state.
 * @param {YM2608OperationProgram} plan
 * @param {{clock?:number,validateArguments?:boolean}} [options]
 * @returns {YM2608OperationProgram} */
export declare function validateYm2608Operations(plan: YM2608OperationProgram, { clock, validateArguments }?: {
    clock?: number;
    validateArguments?: boolean;
}): YM2608OperationProgram;
/** Compile one virtual pass. Baseline adoption never contributes write rows.
 * @param {YM2608OperationProgram} plan @param {YM2608OperationState} state
 * @param {{clock?:number}} [options] @returns {YM2608CompiledWrite[]} */
export declare function compileYm2608Operations(plan: YM2608OperationProgram, state: YM2608OperationState, { clock }?: {
    clock?: number;
}): YM2608CompiledWrite[];

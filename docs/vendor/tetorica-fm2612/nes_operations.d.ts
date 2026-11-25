import { NesApuSynth } from './nesapusynth.js';
export { createNesOperationResetState, validateNesOperationState } from './nes_operation_state.js';
export type NESOperationState = import('./nes_operation_state.js').NesOperationState;
export type NESOperationTime = {
    unit: 'sample' | 'seconds';
    value: number;
};
export type NESTimedOperation = {
    time: NESOperationTime;
    order: number;
    method: string;
    args: unknown[];
};
export type NESOperationProgram = {
    version: 1;
    chip: 'nes';
    referenceSampleRate: number;
    operations: NESTimedOperation[];
};
export type NESBuildOptions = {
    referenceSampleRate?: number;
};
export type NESRegisterWrite = {
    register: number;
    value: number;
};
export type NESCompiledWrite = NESRegisterWrite & {
    offsetSeconds: number;
    operationIndex: number;
    writeIndex: number;
};
export type NESOperationRecorder = {
    [K in 'writeRegister' | 'setFrequency' | 'setNote' | 'noteOn' | 'noteOff' | 'keyOn' | 'keyOff']: (...args: Parameters<NesApuSynth[K]>) => NESOperationRecorder;
} & {
    atSample(value: number): NESOperationRecorder;
    atSeconds(value: number): NESOperationRecorder;
    pulse: { [K in keyof NesApuSynth['pulse']]: (...args: Parameters<NesApuSynth['pulse'][K]>) => NESOperationRecorder; };
    triangle: { [K in keyof NesApuSynth['triangle']]: (...args: Parameters<NesApuSynth['triangle'][K]>) => NESOperationRecorder; };
    fds: { [K in 'setWave' | 'setModulation' | 'setVolume' | 'setFrequency' | 'setNote' | 'noteOn' | 'noteOff' | 'keyOn' | 'keyOff']: (...args: Parameters<NesApuSynth['fds'][K]>) => NESOperationRecorder; };
    dmc: { [K in 'play' | 'stop']: (...args: Parameters<NesApuSynth['dmc'][K]>) => NESOperationRecorder; };
    noise: { [K in keyof NesApuSynth['noise']]: (...args: Parameters<NesApuSynth['noise'][K]>) => NESOperationRecorder; };
};
export declare const NES_OPERATION_METHODS: readonly string[];
export declare const MAX_NES_OPERATIONS = 4096;
/** @param {NESTimedOperation} operation @param {number} [referenceSampleRate]
 * @returns {number} */
export declare function nesOperationOffsetSeconds(operation: NESTimedOperation, referenceSampleRate?: number): number;
/** Record once. This function never constructs a chip or resolves register bytes.
 * Offsets are absolute from reservation start and independent of output rate.
 * @param {(builder:NESOperationRecorder)=>void} callback
 * @param {NESBuildOptions} [options] @returns {NESOperationProgram} */
export declare function buildNesOperations(callback: (builder: NESOperationRecorder) => void, options?: NESBuildOptions): NESOperationProgram;
/** A scratch chip shares existing parameter validation and register conversion.
 * State adoption and raw-shadow updates never touch the live SoundChip.
 * @param {{clock?:number,fds?:boolean}} [options]
 * @returns {{resolve(operation:NESTimedOperation,state:NESOperationState):{writes:NESRegisterWrite[],state:NESOperationState}}} */
export declare function createNesOperationResolver({ clock, fds }?: {
    clock?: number;
    fds?: boolean;
}): {
    resolve(operation: NESTimedOperation, state: NESOperationState): {
        writes: NESRegisterWrite[];
        state: NESOperationState;
    };
};
/** Validate all calls using their shared existing conversion, without live state.
 * @param {NESOperationProgram} plan
 * @param {{clock?:number,fds?:boolean,validateArguments?:boolean,initialState?:NESOperationState}} [options]
 * @returns {NESOperationProgram} */
export declare function validateNesOperations(plan: NESOperationProgram, { clock, validateArguments, initialState, fds }?: {
    clock?: number;
    fds?: boolean;
    validateArguments?: boolean;
    initialState?: NESOperationState;
}): NESOperationProgram;
/** Compile one virtual pass. Baseline adoption never contributes write rows.
 * @param {NESOperationProgram} plan @param {NESOperationState} state
 * @param {{clock?:number,fds?:boolean}} [options] @returns {NESCompiledWrite[]} */
export declare function compileNesOperations(plan: NESOperationProgram, state: NESOperationState, { clock, fds }?: {
    clock?: number;
    fds?: boolean;
}): NESCompiledWrite[];

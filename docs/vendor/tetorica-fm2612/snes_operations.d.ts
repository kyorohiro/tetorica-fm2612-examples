import { SnesSynth } from './snessynth.js';
export { createSnesOperationResetState, validateSnesOperationState } from './snes_operation_state.js';
export type SNESOperationState = import('./snes_operation_state.js').SnesOperationState;
export type SNESOperationProgram = {
    version: 1;
    chip: 'snes';
    referenceSampleRate: number;
    operations: SNESTimedOperation[];
};
export type SNESBuildOptions = {
    referenceSampleRate?: number;
};
export type SNESTimedOperation = {
    time: {
        unit: 'sample' | 'seconds';
        value: number;
    };
    order: number;
    method: string;
    args: any[];
};
export type SNESRegisterWrite = {
    register: number;
    value: number;
};
export type SNESCompiledWrite = SNESRegisterWrite & {
    offsetSeconds: number;
    operationIndex: number;
    writeIndex: number;
};
export type SNESOperationRecorder = {
    atSample: (value: number) => SNESOperationRecorder;
    atSeconds: (value: number) => SNESOperationRecorder;
} & {
    [K in 'setPreset' | 'setChannel' | 'setPitch' | 'setFrequency' | 'setNote' | 'keyOn' | 'keyOff' | 'noteOn' | 'noteOff' | 'writeDsp' | 'setEcho']: (...args: Parameters<SnesSynth[K]>) => SNESOperationRecorder;
};
export declare const SNES_OPERATION_METHODS: readonly string[];
export declare const MAX_SNES_OPERATIONS = 4096;
/** @param {SNESTimedOperation} operation @param {number} [referenceSampleRate]
 * @returns {number} */
export declare function snesOperationOffsetSeconds(operation: SNESTimedOperation, referenceSampleRate?: number): number;
/** Record once. This function never constructs a chip or resolves register bytes.
 * Offsets are absolute from reservation start and independent of output rate.
 * @param {(builder:SNESOperationRecorder)=>void} callback
 * @param {SNESBuildOptions} [options] @returns {SNESOperationProgram} */
export declare function buildSnesOperations(callback: (builder: SNESOperationRecorder) => void, options?: SNESBuildOptions): SNESOperationProgram;
/** A scratch chip shares existing parameter validation and register conversion.
 * State adoption and raw-shadow updates never touch the live SoundChip.
 * @param {{clock?:number}} [options]
 * @returns {{resolve(operation:SNESTimedOperation,state:SNESOperationState):{writes:SNESRegisterWrite[],state:SNESOperationState}}} */
export declare function createSnesOperationResolver({ clock }?: {
    clock?: number;
}): {
    resolve(operation: SNESTimedOperation, state: SNESOperationState): {
        writes: SNESRegisterWrite[];
        state: SNESOperationState;
    };
};
/** Validate all calls using their shared existing conversion, without live state.
 * @param {SNESOperationProgram} plan
 * @param {{clock?:number,validateArguments?:boolean,initialState?:SNESOperationState}} [options]
 * @returns {SNESOperationProgram} */
export declare function validateSnesOperations(plan: SNESOperationProgram, { clock, validateArguments, initialState }?: {
    clock?: number;
    validateArguments?: boolean;
    initialState?: SNESOperationState;
}): SNESOperationProgram;
/** Compile one virtual pass. Baseline adoption never contributes write rows.
 * @param {SNESOperationProgram} plan @param {SNESOperationState} state
 * @param {{clock?:number}} [options] @returns {SNESCompiledWrite[]} */
export declare function compileSnesOperations(plan: SNESOperationProgram, state: SNESOperationState, { clock }?: {
    clock?: number;
}): SNESCompiledWrite[];

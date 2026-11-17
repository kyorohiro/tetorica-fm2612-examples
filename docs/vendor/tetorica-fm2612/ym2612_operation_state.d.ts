/** @typedef {{registers:number[][],frequencyLatches:number[],pitches:number[],specialPitches:number[],keyMasks:number[]}} YM2612OperationState */
export type YM2612OperationState = {
    registers: number[][];
    frequencyLatches: number[];
    pitches: number[];
    specialPitches: number[];
    keyMasks: number[];
};
/** Register/control shadow used only for operation resolution, not an audio
 * engine save-state. Frequency writes have two chip-global high-byte latches;
 * a high write alone does not change a channel's committed pitch.
 * @returns {YM2612OperationState} */
export declare function createYm2612OperationResetState(): YM2612OperationState;
/** Validate and detach every register/control array.
 * @param {unknown} state @returns {YM2612OperationState} */
export declare function validateYm2612OperationState(state: unknown): YM2612OperationState;
/** Mutates an independently owned shadow after an actually applied write.
 * The write itself is never removed, including repeated key/timer writes.
 * @param {YM2612OperationState} state @param {number} port
 * @param {number} register @param {number} value @returns {void} */
export declare function observeYm2612OperationWrite(state: YM2612OperationState, port: number, register: number, value: number): void;
/** Decode the shadow into the existing high-level resolver. Register conversion
 * remains in YM2612Synth; this function performs no writes or live adoption.
 * @param {import('./ym2612synth.js').YM2612Synth} synth
 * @param {YM2612OperationState} state @returns {void} */
export declare function adoptYm2612OperationState(synth: import('./ym2612synth.js').YM2612Synth, state: YM2612OperationState): void;

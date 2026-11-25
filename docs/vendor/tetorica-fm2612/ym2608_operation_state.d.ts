export type YM2608OperationState = import('./ym2612_operation_state.js').YM2612OperationState & {
    ssgLevels: number[];
    rhythmLevels: number[];
    adpcmRegisters: number[];
    prescaler: number;
};
export declare function createYm2608OperationResetState(): {
    registers: number[][];
    frequencyLatches: number[];
    pitches: number[];
    specialPitches: number[];
    keyMasks: number[];
    ssgLevels: number[];
    rhythmLevels: any[];
    adpcmRegisters: any[];
    prescaler: number;
};
export declare function validateYm2608OperationState(state: any): {
    registers: number[][];
    frequencyLatches: number[];
    pitches: number[];
    specialPitches: number[];
    keyMasks: number[];
    adpcmRegisters: any[];
    ssgLevels: any[];
    rhythmLevels: any[];
    prescaler: number;
};
export declare function observeYm2608OperationWrite(state: any, port: any, register: any, value: any): void;
export declare function adoptYm2608OperationState(synth: any, state: any): void;

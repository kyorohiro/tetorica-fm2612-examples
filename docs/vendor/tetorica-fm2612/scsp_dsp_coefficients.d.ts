export declare const DSP_COEFFICIENT_MIN = -4096;
export declare const DSP_COEFFICIENT_MAX = 4095;
export declare const DSP_FEEDBACK_MAX: number;
export declare const coefficientWord: (value: any) => number;
export declare function resolveCoefficientPatch(patch: any, previous: any): {
    keys: (string | symbol)[];
    next: any[];
    changed: number[];
};
/** Validate the optional complete example setup without reading a live core. */
export declare function validateScspDspProgramOptions(options: any): {
    coefficients: {
        0: any;
        1: any;
        2: any;
    };
} | undefined;

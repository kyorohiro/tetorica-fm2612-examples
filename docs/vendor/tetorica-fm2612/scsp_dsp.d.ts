/** Per-instance SCSP DSP program, coefficient and managed Delay owner.
 * Construction and snapshot adoption perform no core writes. Explicit settings
 * start the DSP, preserving PCM allocation, voices and existing TEMP history.
 */
export declare class ScspDspProgram {
    #private;
    constructor(core: any);
    readCoefficients(): {
        codes: number[];
    };
    readProgram(): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
    applyProgram(words: any, options: any): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
    /** Install the fixed Delay inside an allocator-owned, bounded packed ring. */
    setDelay(patch: any, reservation: any): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
    setCoefficients(patch: any): {
        codes: number[];
    };
    setReturn(patch: any): {
        level: number;
        pan: number;
    };
    ensureStarted(): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
    /** Reinstall acknowledged setup after the owning core has been reset. */
    restore(): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
    /** Trusted transport staging copies metadata into a validation-only owner. */
    adoptState(snapshot: any): {
        profile: string;
        configured: boolean;
        words: number[];
        revision: number;
        coefficients: {
            codes: number[];
        };
        return: {
            level: number;
            pan: number;
        };
        delay?: any;
        ram?: any;
    };
}

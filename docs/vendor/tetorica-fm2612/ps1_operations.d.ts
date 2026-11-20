export declare const PS1_OPERATION_METHODS: readonly string[];
export declare const MAX_PS1_OPERATIONS = 4096;
export declare function ps1OperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
/** Record once. This function never constructs a chip or resolves register bytes. */
export declare function buildPs1Operations(callback: any, options?: {}): {
    version: number;
    chip: string;
    referenceSampleRate: any;
    operations: {
        method: string;
        args: any;
        time: {
            unit: any;
            value: any;
        };
        order: number;
    }[];
};
/** Resolver metadata only: no sample bytes, oscillator phase or decoder state. */
export declare function validatePs1OperationState(state: any): {
    registers: any[];
    channels: any[];
    samples: any[];
    gates: any[];
    reverb: any;
    nextAddress: any;
};
export declare function capturePs1OperationState(synth: any): {
    registers: any[];
    channels: any[];
    samples: any[];
    gates: any[];
    reverb: any;
    nextAddress: any;
};
export declare function createPs1OperationResetState(): {
    registers: any[];
    channels: any[];
    samples: any[];
    gates: any[];
    reverb: any;
    nextAddress: any;
};
export declare function createPs1OperationResolver(): {
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            registers: any[];
            channels: any[];
            samples: any[];
            gates: any[];
            reverb: any;
            nextAddress: any;
        };
    };
};
export declare function validatePs1Operations(plan: any): {
    version: number;
    chip: string;
    referenceSampleRate: any;
    operations: {
        method: string;
        args: any;
        time: {
            unit: any;
            value: any;
        };
        order: number;
    }[];
};
export declare function compilePs1Operations(plan: any, state: any): any[];

export declare const AY_OPERATION_METHODS: readonly string[];
export declare const MAX_AY_OPERATIONS = 4096;
export declare function ayOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
/** Record once. This function never constructs a chip or resolves register bytes. */
export declare function buildAyOperations(callback: any, options?: {}): {
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
/** Require complete semantic state; raw-only adoption would lose muted levels. */
export declare function validateAyOperationState(state: any): {
    registers: any[];
    levels: any[];
};
export declare function createAyOperationResetState(): {
    registers: any[];
    levels: number[];
};
/** One scratch chip shares all existing parameter validation and register math.
 * Its transport only collects a batch; callers apply it after complete success. */
export declare function createAyOperationResolver({ clock }?: {
    clock?: number | undefined;
}): {
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            registers: number[];
            levels: number[];
        };
    };
};
/** Validate all calls using their shared existing conversion, without live state. */
export declare function validateAyOperations(plan: any, { clock, validateArguments }?: {
    clock?: number | undefined;
    validateArguments?: boolean | undefined;
}): {
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
/** Compile one virtual pass. Baseline adoption never contributes write rows. */
export declare function compileAyOperations(plan: any, state: any, { clock }?: {
    clock?: number | undefined;
}): any[];

export declare const HUC6280_OPERATION_METHODS: readonly string[];
export declare const MAX_HUC6280_OPERATIONS = 4096;
export declare function huc6280OperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
/** Record once. This function never constructs a chip or resolves register bytes. */
export declare function buildHuc6280Operations(callback: any, options?: {}): {
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
/** Full authoring metadata, including the selected register bank and Wave RAM
 * write cursor. This is resolver state, not oscillator/envelope phase. */
export declare function validateHuc6280OperationState(state: any): {
    clock: any;
    initialized: any;
    selectedChannel: any;
    globals: any[];
    registers: any;
    waveforms: any;
    indices: any[];
};
export declare function createHuc6280OperationResetState({ clock }?: {
    clock?: number | undefined;
}): {
    clock: any;
    initialized: any;
    selectedChannel: any;
    globals: any[];
    registers: any;
    waveforms: any;
    indices: any[];
};
/** One scratch chip shares all existing parameter validation and register math.
 * Its transport only collects a batch; callers apply it after complete success. */
export declare function createHuc6280OperationResolver({ clock }?: {
    clock?: number | undefined;
}): {
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            clock: number;
            initialized: boolean;
            selectedChannel: number;
            globals: number[];
            registers: number[][];
            waveforms: number[][];
            indices: number[];
        };
    };
};
/** Validate all calls using their shared existing conversion, without live state. */
export declare function validateHuc6280Operations(plan: any, { clock, validateArguments }?: {
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
export declare function compileHuc6280Operations(plan: any, state: any, { clock }?: {
    clock?: number | undefined;
}): any[];
/** Live register reservations do not transfer Wave RAM: the rendering cursor
 * may have advanced independently of the sent-register mirror. DDA R6 is safe. */
export declare function validateHuc6280RegisterOnlyPlan(plan: any, state: any): void;

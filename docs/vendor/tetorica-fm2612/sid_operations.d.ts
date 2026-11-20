export declare const SID_OPERATION_METHODS: readonly string[];
export declare const MAX_SID_OPERATIONS = 4096;
export declare function sidOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
/** Run the recorder once. It neither constructs a chip nor reads live state. */
/** @template Result
 * @param {(builder:import('./sid_timed_client.js').SidOperationRecorder)=>Result & (Result extends PromiseLike<unknown>?never:unknown)} callback
 * @param {{referenceSampleRate?:number}} [options]
 * @returns {import('./sid_timed_client.js').SidOperationProgram}
 */
export declare function buildSidOperations<Result>(callback: (builder: import('./sid_timed_client.js').SidOperationRecorder) => Result & (Result extends PromiseLike<unknown> ? never : unknown), options?: {
    referenceSampleRate?: number;
}): import('./sid_timed_client.js').SidOperationProgram;
/** Sent registers and initialized/configuration metadata only. Derived live
 * inspection fields are accepted from SidSynth._getState(), then discarded;
 * oscillator phase, envelope progress and C64 memory are not resolver state. */
export declare function validateSidOperationState(state: any): {
    clock: number;
    model: any;
    initialized: any;
    registers: any[];
};
export declare function createSidOperationResetState({ clock, model }?: {
    clock?: 985248 | undefined;
    model?: string | undefined;
}): {
    clock: number;
    model: any;
    initialized: any;
    registers: any[];
};
/** One isolated SidSynth shares existing validation and packed-register math.
 * Transport writes are only collected; callers apply the whole successful batch. */
export declare function createSidOperationResolver({ clock, model }?: {
    clock?: 985248 | undefined;
    model?: string | undefined;
}): {
    start: (state: any) => void;
    apply: (operation: any) => any[];
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            clock: number;
            model: any;
            initialized: any;
            registers: any[];
        };
    };
};
/** Validate every call through existing conversion without reading live state. */
export declare function validateSidOperations(plan: any, { clock, model, validateArguments }?: {
    clock?: 985248 | undefined;
    model?: string | undefined;
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
/** One virtual pass, preserving all operation writes and their same-time order.
 * Baseline adoption never contributes writes to the returned trace. */
/**
 * @param {import('./sid_timed_client.js').SidOperationProgram} plan
 * @param {any} state
 * @param {{clock?:number,model?:'6581'|'8580'}} [options]
 * @returns {import('./sid_timed_client.js').SidCompiledWrite[]}
 */
export declare function compileSidOperations(plan: import('./sid_timed_client.js').SidOperationProgram, state: any, { clock, model }?: {
    clock?: number;
    model?: '6581' | '8580';
}): import('./sid_timed_client.js').SidCompiledWrite[];

export declare const WONDERSWAN_OPERATION_METHODS: readonly string[];
export declare const MAX_WONDERSWAN_OPERATIONS = 4096;
export declare function wonderswanOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
export type WonderSwanOperationRecorder = {
    atSample: (offset: number) => WonderSwanOperationRecorder;
    atSeconds: (offset: number) => WonderSwanOperationRecorder;
    setVolume: (channel: 0 | 1 | 2 | 3, left: number, right?: number) => WonderSwanOperationRecorder;
    setPan: (channel: 0 | 1 | 2 | 3, left: number, right?: number) => WonderSwanOperationRecorder;
    setFrequency: (channel: 0 | 1 | 2 | 3, hz: number) => WonderSwanOperationRecorder;
    setNote: (channel: 0 | 1 | 2 | 3, note: string | number) => WonderSwanOperationRecorder;
    setNoise: (options: {
        enabled: boolean;
        type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
        reset?: boolean;
    }) => WonderSwanOperationRecorder;
    setSweep: (options: {
        enabled: boolean;
        step?: number;
        time?: number;
    }) => WonderSwanOperationRecorder;
    keyOn: (channel: 0 | 1 | 2 | 3) => WonderSwanOperationRecorder;
    keyOff: (channel: 0 | 1 | 2 | 3) => WonderSwanOperationRecorder;
};
/** Record once. This function never constructs a chip or resolves register bytes. */
/**
 * @typedef {Object} WonderSwanOperationRecorder
 * @property {(offset:number)=>WonderSwanOperationRecorder} atSample
 * @property {(offset:number)=>WonderSwanOperationRecorder} atSeconds
 * @property {(channel:0|1|2|3,left:number,right?:number)=>WonderSwanOperationRecorder} setVolume
 * @property {(channel:0|1|2|3,left:number,right?:number)=>WonderSwanOperationRecorder} setPan
 * @property {(channel:0|1|2|3,hz:number)=>WonderSwanOperationRecorder} setFrequency
 * @property {(channel:0|1|2|3,note:string|number)=>WonderSwanOperationRecorder} setNote
 * @property {(options:{enabled:boolean,type?:0|1|2|3|4|5|6|7,reset?:boolean})=>WonderSwanOperationRecorder} setNoise
 * @property {(options:{enabled:boolean,step?:number,time?:number})=>WonderSwanOperationRecorder} setSweep
 * @property {(channel:0|1|2|3)=>WonderSwanOperationRecorder} keyOn
 * @property {(channel:0|1|2|3)=>WonderSwanOperationRecorder} keyOff
 */
/** @template Result
 * @param {(builder:WonderSwanOperationRecorder)=>Result & (Result extends PromiseLike<unknown>?never:unknown)} callback
 * @param {{referenceSampleRate?:number}} [options]
 * @returns {{version:1,chip:'wonderswan',referenceSampleRate:number,operations:Array<{time:{unit:'sample'|'seconds',value:number},order:number,method:string,args:unknown[]}>}}
 */
export declare function buildWonderSwanOperations<Result>(callback: (builder: WonderSwanOperationRecorder) => Result & (Result extends PromiseLike<unknown> ? never : unknown), options?: {
    referenceSampleRate?: number;
}): {
    version: 1;
    chip: 'wonderswan';
    referenceSampleRate: number;
    operations: Array<{
        time: {
            unit: 'sample' | 'seconds';
            value: number;
        };
        order: number;
        method: string;
        args: unknown[];
    }>;
};
/** Detached sent-register and RAM metadata. Not oscillator/LFSR/Sweep phase. */
export declare function validateWonderSwanOperationState(state: any): {
    clock: any;
    initialized: any;
    registers: any[];
    memory: any[];
};
export declare function createWonderSwanOperationResetState({ clock }?: {
    clock?: number | undefined;
}): {
    clock: any;
    initialized: any;
    registers: any[];
    memory: any[];
};
/** One scratch chip shares all existing parameter validation and register math.
 * Its transport only collects a batch; callers apply it after complete success. */
export declare function createWonderSwanOperationResolver({ clock }?: {
    clock?: number | undefined;
}): {
    start: (state: any) => void;
    apply: (operation: any) => any[];
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            clock: number;
            initialized: boolean;
            registers: number[];
            memory: number[];
        };
    };
};
/** Validate all calls using their shared existing conversion, without live state. */
export declare function validateWonderSwanOperations(plan: any, { clock, validateArguments }?: {
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
/**
 * @param {ReturnType<typeof buildWonderSwanOperations>} plan
 * @param {any} state
 * @param {{clock?:number}} [options]
 * @returns {Array<{offsetSeconds:number,register:number,value:number,operationIndex:number,writeIndex:number,channel?:0|1|2|3,controlMask?:number}>}
 */
export declare function compileWonderSwanOperations(plan: ReturnType<typeof buildWonderSwanOperations>, state: any, { clock }?: {
    clock?: number;
}): Array<{
    offsetSeconds: number;
    register: number;
    value: number;
    operationIndex: number;
    writeIndex: number;
    channel?: 0 | 1 | 2 | 3;
    controlMask?: number;
}>;
/** In Voice mode R89 is the DAC byte, not CH2 stereo gain. Keep PCM feeding
 * outside this bounded parameter API, even if mode changes after admission. */
export declare function validateWonderSwanParameterPlan(plan: any, state: any): void;

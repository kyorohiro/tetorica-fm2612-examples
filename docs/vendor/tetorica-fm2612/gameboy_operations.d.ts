export declare const GAMEBOY_OPERATION_METHODS: readonly string[];
export declare const MAX_GAMEBOY_OPERATIONS = 4096;
export declare function gameboyOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
export type GameboyOperationRecorder = {
    atSample: (offset: number) => GameboyOperationRecorder;
    atSeconds: (offset: number) => GameboyOperationRecorder;
    writeRegister: (register: number, value: number) => GameboyOperationRecorder;
    setFrequency: (channel: 0 | 1 | 2, hz: number) => GameboyOperationRecorder;
    setNote: (channel: 0 | 1 | 2, note: string | number) => GameboyOperationRecorder;
    noteOn: (channel: 0 | 1 | 2, note: string | number) => GameboyOperationRecorder;
    keyOn: (channel: 0 | 1 | 2 | 3) => GameboyOperationRecorder;
    keyOff: (channel: 0 | 1 | 2 | 3) => GameboyOperationRecorder;
    setPan: (channel: 0 | 1 | 2 | 3, left: boolean, right: boolean) => GameboyOperationRecorder;
    setMasterVolume: (left: number, right: number) => GameboyOperationRecorder;
    pulse: {
        setVoice: (channel: 0 | 1, voice: import('./gameboysynth.js').GameboyPulseVoice) => GameboyOperationRecorder;
        setDuty: (channel: 0 | 1, duty: 0.125 | 0.25 | 0.5 | 0.75) => GameboyOperationRecorder;
        setEnvelope: (channel: 0 | 1, options: import('./gameboysynth.js').GameboyEnvelopeSettings) => GameboyOperationRecorder;
        setSweep: (options: import('./gameboysynth.js').GameboySweep) => GameboyOperationRecorder;
        setFrequency: (channel: 0 | 1, hz: number) => GameboyOperationRecorder;
        setNote: (channel: 0 | 1, note: string | number) => GameboyOperationRecorder;
        noteOn: (channel: 0 | 1, note: string | number) => GameboyOperationRecorder;
        keyOn: (channel: 0 | 1) => GameboyOperationRecorder;
        keyOff: (channel: 0 | 1) => GameboyOperationRecorder;
    };
    wave: {
        setWaveform: (samples: readonly number[] | Uint8Array) => GameboyOperationRecorder;
        stopAndSetWaveform: (samples: readonly number[] | Uint8Array) => GameboyOperationRecorder;
        setLevel: (level: 0 | 0.25 | 0.5 | 1) => GameboyOperationRecorder;
        setFrequency: (hz: number) => GameboyOperationRecorder;
        setNote: (note: string | number) => GameboyOperationRecorder;
        noteOn: (note: string | number) => GameboyOperationRecorder;
        keyOn: () => GameboyOperationRecorder;
        keyOff: () => GameboyOperationRecorder;
    };
    noise: {
        setVoice: (voice: import('./gameboysynth.js').GameboyNoiseVoice) => GameboyOperationRecorder;
        setEnvelope: (options: import('./gameboysynth.js').GameboyEnvelopeSettings) => GameboyOperationRecorder;
        setParameters: (options: Pick<import('./gameboysynth.js').GameboyNoiseVoice, 'divisor' | 'shift' | 'width'>) => GameboyOperationRecorder;
        keyOn: () => GameboyOperationRecorder;
        keyOff: () => GameboyOperationRecorder;
    };
};
/** Record once. This function never constructs a chip or resolves register bytes. */
/**
 * @typedef {Object} GameboyOperationRecorder
 * @property {(offset:number)=>GameboyOperationRecorder} atSample
 * @property {(offset:number)=>GameboyOperationRecorder} atSeconds
 * @property {(register:number,value:number)=>GameboyOperationRecorder} writeRegister
 * @property {(channel:0|1|2,hz:number)=>GameboyOperationRecorder} setFrequency
 * @property {(channel:0|1|2,note:string|number)=>GameboyOperationRecorder} setNote
 * @property {(channel:0|1|2,note:string|number)=>GameboyOperationRecorder} noteOn
 * @property {(channel:0|1|2|3)=>GameboyOperationRecorder} keyOn
 * @property {(channel:0|1|2|3)=>GameboyOperationRecorder} keyOff
 * @property {(channel:0|1|2|3,left:boolean,right:boolean)=>GameboyOperationRecorder} setPan
 * @property {(left:number,right:number)=>GameboyOperationRecorder} setMasterVolume
 * @property {{setVoice:(channel:0|1,voice:import('./gameboysynth.js').GameboyPulseVoice)=>GameboyOperationRecorder,setDuty:(channel:0|1,duty:0.125|0.25|0.5|0.75)=>GameboyOperationRecorder,setEnvelope:(channel:0|1,options:import('./gameboysynth.js').GameboyEnvelopeSettings)=>GameboyOperationRecorder,setSweep:(options:import('./gameboysynth.js').GameboySweep)=>GameboyOperationRecorder,setFrequency:(channel:0|1,hz:number)=>GameboyOperationRecorder,setNote:(channel:0|1,note:string|number)=>GameboyOperationRecorder,noteOn:(channel:0|1,note:string|number)=>GameboyOperationRecorder,keyOn:(channel:0|1)=>GameboyOperationRecorder,keyOff:(channel:0|1)=>GameboyOperationRecorder}} pulse
 * @property {{setWaveform:(samples:readonly number[]|Uint8Array)=>GameboyOperationRecorder,stopAndSetWaveform:(samples:readonly number[]|Uint8Array)=>GameboyOperationRecorder,setLevel:(level:0|0.25|0.5|1)=>GameboyOperationRecorder,setFrequency:(hz:number)=>GameboyOperationRecorder,setNote:(note:string|number)=>GameboyOperationRecorder,noteOn:(note:string|number)=>GameboyOperationRecorder,keyOn:()=>GameboyOperationRecorder,keyOff:()=>GameboyOperationRecorder}} wave
 * @property {{setVoice:(voice:import('./gameboysynth.js').GameboyNoiseVoice)=>GameboyOperationRecorder,setEnvelope:(options:import('./gameboysynth.js').GameboyEnvelopeSettings)=>GameboyOperationRecorder,setParameters:(options:Pick<import('./gameboysynth.js').GameboyNoiseVoice,'divisor'|'shift'|'width'>)=>GameboyOperationRecorder,keyOn:()=>GameboyOperationRecorder,keyOff:()=>GameboyOperationRecorder}} noise
 */
/** @template Result
 * @param {(builder:GameboyOperationRecorder)=>Result & (Result extends PromiseLike<unknown>?never:unknown)} callback
 * @param {{referenceSampleRate?:number}} [options]
 * @returns {Readonly<{version:1,chip:'gameboy',referenceSampleRate:number,operations:ReadonlyArray<{time:{unit:'sample'|'seconds',value:number},order:number,method:string,args:ReadonlyArray<unknown>}>}>}
 */
export declare function buildGameboyOperations<Result>(callback: (builder: GameboyOperationRecorder) => Result & (Result extends PromiseLike<unknown> ? never : unknown), options?: {
    referenceSampleRate?: number;
}): Readonly<{
    version: 1;
    chip: 'gameboy';
    referenceSampleRate: number;
    operations: ReadonlyArray<{
        time: {
            unit: 'sample' | 'seconds';
            value: number;
        };
        order: number;
        method: string;
        args: ReadonlyArray<unknown>;
    }>;
}>;
/** Sent-register and configured-voice metadata, not oscillator/Envelope/Sweep
 * progress. Key Off can silence a sent register while preserving its voice. */
export declare function validateGameboyOperationState(state: any): {
    clock: any;
    initialized: any;
    registers: any[];
    voice: any[];
};
export declare function createGameboyOperationResetState({ clock }?: {
    clock?: number | undefined;
}): {
    clock: any;
    initialized: any;
    registers: any[];
    voice: any[];
};
/** One scratch chip shares all existing parameter validation and register math.
 * Its transport only collects a batch; callers apply it after complete success. */
export declare function createGameboyOperationResolver({ clock }?: {
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
            voice: number[];
        };
    };
};
/** Validate all calls using their shared existing conversion, without live state. */
export declare function validateGameboyOperations(plan: any, { clock, validateArguments }?: {
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
 * @param {ReturnType<typeof buildGameboyOperations>} plan
 * @param {any} state
 * @param {{clock?:number}} [options]
 * @returns {Array<{offsetSeconds:number,register:number,value:number,operationIndex:number,writeIndex:number}>}
 */
export declare function compileGameboyOperations(plan: ReturnType<typeof buildGameboyOperations>, state: any, { clock }?: {
    clock?: number;
}): Array<{
    offsetSeconds: number;
    register: number;
    value: number;
    operationIndex: number;
    writeIndex: number;
}>;

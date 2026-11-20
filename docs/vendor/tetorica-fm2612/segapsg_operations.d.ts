export declare const PSG_OPERATION_METHODS: readonly string[];
export declare const MAX_PSG_OPERATIONS = 4096;
export declare function psgOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
export type PsgOperationRecorder = {
    atSample: (offset: number) => PsgOperationRecorder;
    atSeconds: (offset: number) => PsgOperationRecorder;
    setPeriod: (channel: 0 | 1 | 2, period: number) => PsgOperationRecorder;
    setFrequency: (channel: 0 | 1 | 2, hz: number) => PsgOperationRecorder;
    setNote: (channel: 0 | 1 | 2, note: string | number) => PsgOperationRecorder;
    noteOn: (channel: 0 | 1 | 2, note: string | number) => PsgOperationRecorder;
    tone: (channel: 0 | 1 | 2, options: {
        period?: number;
        frequency?: number;
        note?: string;
        volume?: number;
        attenuation?: number;
    }) => PsgOperationRecorder;
    keyOn: (channel: 0 | 1 | 2) => PsgOperationRecorder;
    keyOff: (channel: 0 | 1 | 2) => PsgOperationRecorder;
    off: (channel: 0 | 1 | 2) => PsgOperationRecorder;
    setAttenuation: (channel: 0 | 1 | 2 | 3, attenuation: number) => PsgOperationRecorder;
    setNoise: (options?: {
        type?: 'white' | 'periodic';
        rate?: 'low' | 'medium' | 'high' | 'tone3';
    }) => PsgOperationRecorder;
    noise: (options?: {
        type?: 'white' | 'periodic';
        rate?: 'low' | 'medium' | 'high' | 'tone3';
        volume?: number;
        attenuation?: number;
    }) => PsgOperationRecorder;
    noiseVolume: (volume: number) => PsgOperationRecorder;
    noiseOff: () => PsgOperationRecorder;
    setStereo: (mask: number) => PsgOperationRecorder;
    write: (value: number) => PsgOperationRecorder;
};
/** Record once. This function never constructs a chip or resolves register bytes. */
/**
 * @typedef {Object} PsgOperationRecorder
 * @property {(offset:number)=>PsgOperationRecorder} atSample
 * @property {(offset:number)=>PsgOperationRecorder} atSeconds
 * @property {(channel:0|1|2,period:number)=>PsgOperationRecorder} setPeriod
 * @property {(channel:0|1|2,hz:number)=>PsgOperationRecorder} setFrequency
 * @property {(channel:0|1|2,note:string|number)=>PsgOperationRecorder} setNote
 * @property {(channel:0|1|2,note:string|number)=>PsgOperationRecorder} noteOn
 * @property {(channel:0|1|2,options:{period?:number,frequency?:number,note?:string,volume?:number,attenuation?:number})=>PsgOperationRecorder} tone
 * @property {(channel:0|1|2)=>PsgOperationRecorder} keyOn
 * @property {(channel:0|1|2)=>PsgOperationRecorder} keyOff
 * @property {(channel:0|1|2)=>PsgOperationRecorder} off
 * @property {(channel:0|1|2|3,attenuation:number)=>PsgOperationRecorder} setAttenuation
 * @property {(options?:{type?:'white'|'periodic',rate?:'low'|'medium'|'high'|'tone3'})=>PsgOperationRecorder} setNoise
 * @property {(options?:{type?:'white'|'periodic',rate?:'low'|'medium'|'high'|'tone3',volume?:number,attenuation?:number})=>PsgOperationRecorder} noise
 * @property {(volume:number)=>PsgOperationRecorder} noiseVolume
 * @property {()=>PsgOperationRecorder} noiseOff
 * @property {(mask:number)=>PsgOperationRecorder} setStereo
 * @property {(value:number)=>PsgOperationRecorder} write
 */
/** @template Result
 * @param {(builder:PsgOperationRecorder)=>Result & (Result extends PromiseLike<unknown>?never:unknown)} callback
 * @param {{referenceSampleRate?:number}} [options]
 * @returns {Readonly<{version:1,chip:'segapsg',referenceSampleRate:number,operations:ReadonlyArray<{time:{unit:'sample'|'seconds',value:number},order:number,method:string,args:ReadonlyArray<unknown>}>}>}
 */
export declare function buildPsgOperations<Result>(callback: (builder: PsgOperationRecorder) => Result & (Result extends PromiseLike<unknown> ? never : unknown), options?: {
    referenceSampleRate?: number;
}): Readonly<{
    version: 1;
    chip: 'segapsg';
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
/** Detached command/authoring state. No oscillator/LFSR phase or PCM is captured.
 * `attenuations` are remembered next-key levels, not effective mute values. */
export declare function validatePsgOperationState(state: any): {
    clock: any;
    stereoEnabled: any;
    attenuations: any;
    periods: any;
    latched: any;
    noiseMode: any;
    stereo: any;
};
/** @param {{clock?:number,stereoEnabled?:boolean}} [options] */
export declare function createPsgOperationResetState({ clock, stereoEnabled, }?: {
    clock?: number;
    stereoEnabled?: boolean;
}): {
    clock: any;
    stereoEnabled: any;
    attenuations: any;
    periods: any;
    latched: any;
    noiseMode: any;
    stereo: any;
};
/** Reuse SegaPSGSynth parameter math and validation on a private transport.
 * Rows are `{value,register,channel}` command bytes. `register` is the logical
 * PSG latch target 0..7, not an address port. Game Gear pan writes are `{stereo}`.
 * Raw data bytes resolve against the currently applied latch; repeated bytes
 * are retained (Noise writes reset the LFSR even when their value is unchanged). */
export declare function createPsgOperationResolver({ clock, stereoEnabled, }?: {
    clock?: number | undefined;
    stereoEnabled?: boolean | undefined;
}): {
    start: (state: any) => void;
    apply: (operation: any) => any[];
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            clock: any;
            stereoEnabled: any;
            attenuations: any;
            periods: any;
            latched: any;
            noiseMode: any;
            stereo: any;
        };
    };
};
/** Admission validation never reads or mutates a live chip. */
export declare function validatePsgOperations(plan: any, { clock, stereoEnabled, validateArguments, }?: {
    clock?: number | undefined;
    stereoEnabled?: boolean | undefined;
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
/** Compile one pass from a detached state. Initial-state adoption emits no rows. */
/** @param {ReturnType<typeof buildPsgOperations>} plan
 * @param {any} state
 * @param {{clock?:number,stereoEnabled?:boolean}} [options]
 * @returns {Array<{offsetSeconds:number,operationIndex:number,writeIndex:number}&({value:number,register:number,channel:number}|{stereo:number})>}
 */
export declare function compilePsgOperations(plan: ReturnType<typeof buildPsgOperations>, state: any, { clock, stereoEnabled, }?: {
    clock?: number;
    stereoEnabled?: boolean;
}): Array<{
    offsetSeconds: number;
    operationIndex: number;
    writeIndex: number;
} & ({
    value: number;
    register: number;
    channel: number;
} | {
    stereo: number;
})>;

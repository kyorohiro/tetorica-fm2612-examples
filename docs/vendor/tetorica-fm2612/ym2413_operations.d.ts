export declare const OPLL_OPERATION_METHODS: readonly string[];
export declare const MAX_OPLL_OPERATIONS = 4096;
export declare function opllOperationOffsetSeconds(operation: any, referenceSampleRate?: number): any;
export type OpllOperationChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type OpllOperationUserPatch = {
    label?: string;
    feedback?: number;
    operators?: [import('./ym2413synth.js').YM2413UserOperatorParams?, Omit<import('./ym2413synth.js').YM2413UserOperatorParams, 'tl'>?];
};
export type OpllOperationRecorder = {
    atSample: (offset: number) => OpllOperationRecorder;
    atSeconds: (offset: number) => OpllOperationRecorder;
    writeRegister: (register: number, value: number) => OpllOperationRecorder;
    setUserPatch: (patch: OpllOperationUserPatch | number[]) => OpllOperationRecorder;
    setUserOperator: ((operator: 0, params: import('./ym2413synth.js').YM2413UserOperatorParams) => OpllOperationRecorder) & ((operator: 1, params: Omit<import('./ym2413synth.js').YM2413UserOperatorParams, 'tl'>) => OpllOperationRecorder);
    setVoice: (channel: OpllOperationChannel, voice: import('./ym2413synth.js').YM2413Voice) => OpllOperationRecorder;
    setPreset: (channel: OpllOperationChannel, preset: number | (import('./ym2413synth.js').YM2413Voice & {
        userPatch?: OpllOperationUserPatch | number[];
    })) => OpllOperationRecorder;
    setInstrument: (channel: OpllOperationChannel, instrument: number, attenuation?: number) => OpllOperationRecorder;
    setAttenuation: (channel: OpllOperationChannel, attenuation: number) => OpllOperationRecorder;
    setSustain: (channel: OpllOperationChannel, enabled: boolean) => OpllOperationRecorder;
    setPitch: (channel: OpllOperationChannel, fnum: number, block?: number) => OpllOperationRecorder;
    setFrequency: (channel: OpllOperationChannel, hz: number) => OpllOperationRecorder;
    setNote: (channel: OpllOperationChannel, note: string | number) => OpllOperationRecorder;
    keyOn: (channel: OpllOperationChannel) => OpllOperationRecorder;
    keyOff: (channel: OpllOperationChannel) => OpllOperationRecorder;
    noteOn: (channel: OpllOperationChannel, note: string | number) => OpllOperationRecorder;
    noteOff: (channel: OpllOperationChannel) => OpllOperationRecorder;
    setRhythm: (settings: import('./ym2413synth.js').YM2413Rhythm) => OpllOperationRecorder;
    setRhythmLevels: (levels: import('./ym2413synth.js').YM2413RhythmLevels) => OpllOperationRecorder;
    setRhythmLevel: (drum: import('./ym2413synth.js').YM2413Drum, attenuation: number) => OpllOperationRecorder;
};
/** Record once. This function never constructs a chip or resolves register bytes. */
/**
 * @typedef {0|1|2|3|4|5|6|7|8} OpllOperationChannel
 * @typedef {{label?:string,feedback?:number,operators?:[import('./ym2413synth.js').YM2413UserOperatorParams?,Omit<import('./ym2413synth.js').YM2413UserOperatorParams,'tl'>?]}} OpllOperationUserPatch
 * @typedef {Object} OpllOperationRecorder
 * @property {(offset:number)=>OpllOperationRecorder} atSample
 * @property {(offset:number)=>OpllOperationRecorder} atSeconds
 * @property {(register:number,value:number)=>OpllOperationRecorder} writeRegister
 * @property {(patch:OpllOperationUserPatch|number[])=>OpllOperationRecorder} setUserPatch
 * @property {((operator:0,params:import('./ym2413synth.js').YM2413UserOperatorParams)=>OpllOperationRecorder)&((operator:1,params:Omit<import('./ym2413synth.js').YM2413UserOperatorParams,'tl'>)=>OpllOperationRecorder)} setUserOperator
 * @property {(channel:OpllOperationChannel,voice:import('./ym2413synth.js').YM2413Voice)=>OpllOperationRecorder} setVoice
 * @property {(channel:OpllOperationChannel,preset:number|(import('./ym2413synth.js').YM2413Voice&{userPatch?:OpllOperationUserPatch|number[]}))=>OpllOperationRecorder} setPreset
 * @property {(channel:OpllOperationChannel,instrument:number,attenuation?:number)=>OpllOperationRecorder} setInstrument
 * @property {(channel:OpllOperationChannel,attenuation:number)=>OpllOperationRecorder} setAttenuation
 * @property {(channel:OpllOperationChannel,enabled:boolean)=>OpllOperationRecorder} setSustain
 * @property {(channel:OpllOperationChannel,fnum:number,block?:number)=>OpllOperationRecorder} setPitch
 * @property {(channel:OpllOperationChannel,hz:number)=>OpllOperationRecorder} setFrequency
 * @property {(channel:OpllOperationChannel,note:string|number)=>OpllOperationRecorder} setNote
 * @property {(channel:OpllOperationChannel)=>OpllOperationRecorder} keyOn
 * @property {(channel:OpllOperationChannel)=>OpllOperationRecorder} keyOff
 * @property {(channel:OpllOperationChannel,note:string|number)=>OpllOperationRecorder} noteOn
 * @property {(channel:OpllOperationChannel)=>OpllOperationRecorder} noteOff
 * @property {(settings:import('./ym2413synth.js').YM2413Rhythm)=>OpllOperationRecorder} setRhythm
 * @property {(levels:import('./ym2413synth.js').YM2413RhythmLevels)=>OpllOperationRecorder} setRhythmLevels
 * @property {(drum:import('./ym2413synth.js').YM2413Drum,attenuation:number)=>OpllOperationRecorder} setRhythmLevel
 */
/** @template Result
 * @param {(builder:OpllOperationRecorder)=>Result & (Result extends PromiseLike<unknown>?never:unknown)} callback
 * @param {{referenceSampleRate?:number}} [options]
 * @returns {Readonly<{version:1,chip:'ym2413',referenceSampleRate:number,operations:ReadonlyArray<{time:{unit:'sample'|'seconds',value:number},order:number,method:string,args:ReadonlyArray<unknown>}>}>}
 */
export declare function buildOpllOperations<Result>(callback: (builder: OpllOperationRecorder) => Result & (Result extends PromiseLike<unknown> ? never : unknown), options?: {
    referenceSampleRate?: number;
}): Readonly<{
    version: 1;
    chip: 'ym2413';
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
/** Complete register-authoring state, not an oscillator/Envelope save state. */
export declare function validateOpllOperationState(state: any): {
    clock: any;
    registers: any[];
};
/** Hardware reset image; useful starter patches are deliberately not installed. */
/** @param {{clock?:number}} [options] */
export declare function createOpllOperationResetState({ clock }?: {
    clock?: number;
}): {
    clock: any;
    registers: any[];
};
/** Resolve with the existing YM2413Synth against an isolated 64-byte shadow.
 * Shared User/Rhythm fields are read immediately before each operation.
 * R14 rows authored by setRhythm carry `intentMask` for the requested percussion
 * trigger bits, matching the immediate client. Unrelated drum Gate bits must
 * not become owned by this operation merely because the shared byte includes them.
 * Raw writeRegister(R14, value) is a complete write and has no intentMask. */
export declare function createOpllOperationResolver({ clock }?: {
    clock?: number | undefined;
}): {
    start: (state: any) => void;
    apply: (operation: any) => any[];
    resolve(operation: any, state: any): {
        writes: any[];
        state: {
            clock: number;
            registers: number[];
        };
    };
};
/** Structural copies can be validated independently of the actual renderer state. */
export declare function validateOpllOperations(plan: any, { clock, validateArguments }?: {
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
/** Simulate only the authored operations. Baseline adoption emits no writes. */
/** @param {ReturnType<typeof buildOpllOperations>} plan
 * @param {any} state
 * @param {{clock?:number}} [options]
 * @returns {Array<{offsetSeconds:number,register:number,value:number,operationIndex:number,writeIndex:number,intentMask?:number}>}
 */
export declare function compileOpllOperations(plan: ReturnType<typeof buildOpllOperations>, state: any, { clock }?: {
    clock?: number;
}): Array<{
    offsetSeconds: number;
    register: number;
    value: number;
    operationIndex: number;
    writeIndex: number;
    intentMask?: number;
}>;

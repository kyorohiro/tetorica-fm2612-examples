/** Shared optional reservation path for independent Playground chip processors.
 * Untagged standalone commands stay immediate. RPC setters acknowledge acceptance
 * while their sound changes wait for the reserved audio frame.
 */
/** @param {string} chip @param {any} command
 * @param {{psgLatch?:number,hucChannel?:number,opllRhythm?:number,wonderswanRegisters?:ArrayLike<number>}} [state] */
export declare function identifyPerformanceNote(chip: string, { method, type, args, register, value, channel, controlMask, psgRegister, port: registerPort }: any, { psgLatch, hucChannel, opllRhythm, wonderswanRegisters }?: {
    psgLatch?: number;
    hucChannel?: number;
    opllRhythm?: number;
    wonderswanRegisters?: ArrayLike<number>;
}): number | "adpcm" | {
    allOff: boolean;
    key?: undefined;
    on?: undefined;
    events?: undefined;
} | {
    allOff?: undefined;
    events: {
        key: number;
        on: boolean;
    }[];
    key?: undefined;
    on?: undefined;
} | {
    allOff?: undefined;
    key: any;
    on: any;
    events?: undefined;
} | {
    allOff?: undefined;
    key?: undefined;
    on?: undefined;
    events: {
        key: string;
        on: boolean;
    }[];
} | null;
export declare function performanceNoteRelease(chip: any, key: any): {
    method: string;
    args: any[];
};
/** Channel touched by native register commands, used only while an editor holds a key.
 * @param {string} chip @param {any} command
 * @param {{hucChannel?:number,psgLatch?:number,rfChannel?:number,wonderswanRegisters?:ArrayLike<number>,pokeyRegisters?:ArrayLike<number>}} [state] */
export declare function nativeVoiceChannel(chip: string, { method, type, args, channel, psgRegister, register: rawRegister }: any, { hucChannel, psgLatch, rfChannel, wonderswanRegisters, pokeyRegisters }?: {
    hucChannel?: number;
    psgLatch?: number;
    rfChannel?: number;
    wonderswanRegisters?: ArrayLike<number>;
    pokeyRegisters?: ArrayLike<number>;
}): any;
export declare function createProcessorPerformance({ apply, prepare, validate, patternCommandCost, onDiscard, onBlocked, chip, releaseNote, getPsgLatch, getPsgMode, getHucChannel, getRfChannel, getRfMask, getOpllRhythm, getAyRegisters, getOplRegisters, getWonderSwanRegisters, getPokeyRegisters, trackImmediateNotes, immediate, nowFrame, rate }: {
    apply: any;
    chip: any;
    getAyRegisters: any;
    getHucChannel: any;
    getOplRegisters: any;
    getOpllRhythm: any;
    getPokeyRegisters: any;
    getPsgLatch: any;
    getPsgMode: any;
    getRfChannel: any;
    getRfMask: any;
    getWonderSwanRegisters: any;
    immediate?: never[] | undefined;
    nowFrame?: (() => any) | undefined;
    onBlocked: any;
    onDiscard: any;
    patternCommandCost: any;
    prepare: any;
    rate?: any;
    releaseNote: any;
    trackImmediateNotes?: boolean | undefined;
    validate: any;
}): {
    receive(data: any, port: any): boolean;
    render(left: any, right: any, render: any): void;
    beginAudition(channel: any, owner: any): void;
    endAudition(channel: any, owner: any): void;
    applyImmediate(command: any, port: any, metadata: any): boolean | undefined;
    schedulePattern: (spec: any, reply: any) => {
        name: any;
        startFrame: any;
        sampleRate: any;
        entries: any;
        repeatSeconds: any;
    };
    validatePattern: (spec: any) => {
        name: any;
        entries: {
            offsetSeconds: any;
            command: any;
        }[];
        repeatSeconds: any;
        startFrame: number;
        cost: number;
        performance: {
            session: any;
            owner: any;
            time: any;
        };
    };
    clearPattern: (name: string, { session, owner }?: {
        session?: number;
        owner?: string;
    }) => boolean;
    commitPatterns: (changes: any, { session, owner, dryRun }?: {
        session: number;
        owner: string;
        dryRun?: boolean;
    }, reply?: (message: any) => void) => {
        session: number;
        owner: string;
        reservations: {
            name: any;
            startFrame: any;
            sampleRate: any;
            entries: any;
            repeatSeconds: any;
        }[];
        cleared: any[];
    };
    cancelPatternOwner: (owner: string, { session }?: {
        session?: number;
    }) => boolean;
    cancelOwner: (owner: any, reply: any) => void;
    nowFrame: () => any;
    clear(): void;
    getStats: () => {
        activeSession: number;
        latestSession: number;
        queuedCommands: number;
        queuedBatches: number;
        patternCount: number;
        storedPatternCommands: number;
        patternRate: number;
        storedPatternCost: number;
        patternCostRate: number;
        lateCommands: number;
        maxLateFrames: number;
        rejectedBatches: number;
        discardedCommands: number;
    };
};

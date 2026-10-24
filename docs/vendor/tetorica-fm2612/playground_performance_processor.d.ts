/** Shared optional reservation path for independent Playground chip processors.
 * Untagged standalone commands stay immediate. RPC setters acknowledge acceptance
 * while their sound changes wait for the reserved audio frame.
 */
export declare function identifyPerformanceNote(chip: any, { method, type, args, register, value, channel, psgRegister, port: registerPort }: {
    args?: never[] | undefined;
    channel: any;
    method: any;
    port?: number | undefined;
    psgRegister: any;
    register: any;
    type: any;
    value: any;
}, { psgLatch, hucChannel, opllRhythm }?: {
    hucChannel?: number | undefined;
    opllRhythm?: number | undefined;
    psgLatch?: number | undefined;
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
/** Channel touched by native register commands, used only while an editor holds a key. */
export declare function nativeVoiceChannel(chip: any, { method, type, args, channel, psgRegister }: {
    args?: never[] | undefined;
    channel: any;
    method: any;
    psgRegister: any;
    type: any;
}, { hucChannel, psgLatch, rfChannel }?: {
    hucChannel?: number | undefined;
    psgLatch?: number | undefined;
    rfChannel?: number | undefined;
}): any;
export declare function createProcessorPerformance({ apply, prepare, validate, onDiscard, onBlocked, chip, releaseNote, getPsgLatch, getPsgMode, getHucChannel, getRfChannel, getRfMask, getOpllRhythm, getAyRegisters, getOplRegisters, trackImmediateNotes, immediate, nowFrame, rate }: {
    apply: any;
    chip: any;
    getAyRegisters: any;
    getHucChannel: any;
    getOplRegisters: any;
    getOpllRhythm: any;
    getPsgLatch: any;
    getPsgMode: any;
    getRfChannel: any;
    getRfMask: any;
    immediate?: never[] | undefined;
    nowFrame?: (() => any) | undefined;
    onBlocked: any;
    onDiscard: any;
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
    clear(): void;
    getStats: () => {
        activeSession: number;
        latestSession: number;
        queuedCommands: number;
        queuedBatches: number;
        lateCommands: number;
        maxLateFrames: number;
        rejectedBatches: number;
        discardedCommands: number;
    };
};

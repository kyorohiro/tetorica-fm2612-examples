/** Shared optional reservation path for independent Playground chip processors.
 * Untagged standalone commands stay immediate. RPC setters acknowledge acceptance
 * while their sound changes wait for the reserved audio frame.
 */
export declare function identifyPerformanceNote(chip: any, { method, type, args, register, value, channel }: {
    args?: never[] | undefined;
    channel: any;
    method: any;
    register: any;
    type: any;
    value: any;
}, { psgLatch, hucChannel }?: {
    hucChannel?: number | undefined;
    psgLatch?: number | undefined;
}): {
    allOff: boolean;
    events?: undefined;
    key?: undefined;
    on?: undefined;
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
    events?: undefined;
    key: any;
    on: any;
} | null;
export declare function performanceNoteRelease(chip: any, key: any): {
    method: string;
    args: any[];
};
/** Channel touched by native register commands, used only while an editor holds a key. */
export declare function nativeVoiceChannel(chip: any, { method, type, args, channel }: {
    args?: never[] | undefined;
    channel: any;
    method: any;
    type: any;
}, { hucChannel }?: {
    hucChannel?: number | undefined;
}): any;
export declare function createProcessorPerformance({ apply, prepare, validate, onDiscard, chip, releaseNote, getPsgLatch, getHucChannel, immediate, nowFrame, rate }: {
    apply: any;
    chip: any;
    getHucChannel: any;
    getPsgLatch: any;
    immediate?: never[] | undefined;
    nowFrame?: (() => any) | undefined;
    onDiscard: any;
    prepare: any;
    rate?: any;
    releaseNote: any;
    validate: any;
}): {
    receive(data: any, port: any): boolean;
    render(left: any, right: any, render: any): void;
    beginAudition(channel: any, owner: any): void;
    endAudition(channel: any, owner: any): void;
    applyImmediate(command: any, port: any, metadata: any): void;
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

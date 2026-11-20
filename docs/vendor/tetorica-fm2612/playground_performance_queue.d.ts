export declare const PERFORMANCE_PATTERN_LIMITS: Readonly<{
    maxPatterns: 128;
    maxPatternEntries: 4096;
    maxPatternRate: 48000;
}>;
/** AudioWorklet performance reservations. Time is absolute audio-clock seconds.
 * Ordinary untagged messages remain the caller's immediate path. A batch is
 * validated on arrival and applied atomically, in submission order, at its frame.
 */
export declare function createPerformanceQueue({ apply, nowFrame, sampleRate, maxCommands, maxPatterns, maxPatternEntries, maxPatternRate, patternCommandCost, validate, prepare, onDiscard, onCancelOwner, }: {
    apply: any;
    maxCommands?: number | undefined;
    maxPatternEntries?: 4096 | undefined;
    maxPatternRate?: 48000 | undefined;
    maxPatterns?: 128 | undefined;
    nowFrame: any;
    onCancelOwner: any;
    onDiscard: any;
    patternCommandCost: any;
    prepare: any;
    sampleRate: any;
    validate: any;
}): {
    /** True means recognized; invalid and stale envelopes never fall through. */
    receive(data: any, reply: any): boolean;
    nextFrame: () => any;
    advance(frame?: any): void;
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
    schedulePattern: (spec: any, reply: any) => {
        name: any;
        startFrame: any;
        sampleRate: any;
        entries: any;
        repeatSeconds: any;
    };
    clearPattern: (name: string, { session, owner }?: {
        session?: number;
        owner?: string;
    }) => boolean;
    clearPatterns: () => void;
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
    clear: () => void;
    cancelOwner: (owner: any, reply: any) => void;
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
/** Applied primary-chip voice ownership. Cancellation releases a loop's current
 * voices without sending an old loop's finally-block key off to a newer voice.
 * writeFm goes through the audition guard, so a held manual key keeps priority.
 */
export declare function createPerformanceChipOwnership({ writeFm, writePsg, channelCount }: {
    channelCount?: number | undefined;
    writeFm: any;
    writePsg: any;
}): {
    observe(command: any, performance: any): void;
    canApplyTimed(command: any, performance: any): boolean;
    cancel(owner: any): void;
    reset: () => void;
};

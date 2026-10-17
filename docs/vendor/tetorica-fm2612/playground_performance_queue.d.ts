/** AudioWorklet performance reservations. Time is absolute audio-clock seconds.
 * Ordinary untagged messages remain the caller's immediate path. A batch is
 * validated on arrival and applied atomically, in submission order, at its frame.
 */
export declare function createPerformanceQueue({ apply, nowFrame, sampleRate, maxCommands, validate, prepare, onDiscard, onCancelOwner, }: {
    apply: any;
    maxCommands?: number | undefined;
    nowFrame: any;
    onCancelOwner: any;
    onDiscard: any;
    prepare: any;
    sampleRate: any;
    validate: any;
}): {
    /** True means recognized; invalid and stale envelopes never fall through. */
    receive(data: any, reply: any): boolean;
    nextFrame: () => any;
    advance(frame?: any): void;
    clear: () => void;
    cancelOwner: (owner: any, reply: any) => void;
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
    cancel(owner: any): void;
    reset: () => void;
};

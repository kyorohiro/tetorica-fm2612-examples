/** Reservation mutations require entry evaluation or an identified liveLoop.
 * Existing chip methods and detached compilation data retain their behavior.
 * Worker callers supply the established 'script' / performanceOwner identities.
 */
export declare function createAyTimedLifecycle({ getLoop, setLoop, entryOwner, loopOwner, cancelOwner, onError, trackAsync }: {
    cancelOwner: any;
    entryOwner: any;
    getLoop: any;
    loopOwner: any;
    onError?: (() => void) | undefined;
    setLoop: any;
    trackAsync?: (() => void) | undefined;
}): {
    wrap(client: any, capability?: any): any;
    begin(isCurrent?: () => boolean): {
        id: string;
        owner: any;
        controller: AbortController;
        controllers: Set<any>;
        names: Map<any, any>;
        pending: never[];
        isCurrent: () => boolean;
    };
    commit(transaction: any): Promise<void>;
    abort: (transaction: any) => void;
    abortCurrent(): void;
    cancelLoop(loop: any, controller: any): void;
    stop(): void;
    readonly entryReservationCount: number;
    readonly hasEntryReservations: boolean;
};

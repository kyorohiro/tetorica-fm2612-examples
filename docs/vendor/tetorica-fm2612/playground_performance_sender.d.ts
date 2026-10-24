/** Worker command timestamps share the AudioContext clock captured by Main.
 * This is a transport lead, independent of beat/DAC scheduling and sample rate.
 */
/** Default script lead; UI audition bypasses this transport. In seconds. */
export declare const DEFAULT_WORKER_LOOKAHEAD_SECONDS = 0.5;
export declare function validateWorkerLookahead(seconds: any): any;
export declare function createPerformanceSender({ getLoop, restoreLoop, onCancelOwner, leaseUntimed, now }?: {
    getLoop?: (() => null) | undefined;
    leaseUntimed?: boolean | undefined;
    now?: (() => number) | undefined;
    onCancelOwner?: (() => void) | undefined;
    restoreLoop?: (() => void) | undefined;
}): {
    configure: (next: any) => void;
    timestamp: () => {
        session: any;
        owner: any;
        time: number;
    } | null;
    /** A MessagePort facade keeps client RPC and event ownership unchanged. */
    port(port: any, kind: any): any;
    cancelOwner(owner: any): void;
    stop(): void;
    immediateCleanup(fn: any): any;
};

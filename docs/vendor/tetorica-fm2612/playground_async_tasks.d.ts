/** Loop-owned asynchronous failures. No clock or sound-chip knowledge. */
/**
 * Track asynchronous work owned by a liveLoop and wake its waits on failure.
 * @template {{stopped: boolean, name?: string, interruptError?: Error}} Loop
 * @param {{getLoop: () => Loop | null, cancelWaits: (loop: Loop) => void,
 *   isActive?: (loop: Loop) => boolean}} options Loop lookup and cancellation hooks.
 * @returns {{track: (promise: PromiseLike<unknown>) => void,
 *   finish: (loop: Loop) => Promise<void>, releaseName: (name?: string) => void,
 *   release: (loop: Loop) => void, clear: () => void}} Loop-owned task lifecycle.
 */
export declare function createLoopAsyncTasks<Loop extends {
    stopped: boolean;
    name?: string;
    interruptError?: Error;
}>({ getLoop, cancelWaits, isActive }: {
    getLoop: () => Loop | null;
    cancelWaits: (loop: Loop) => void;
    isActive?: (loop: Loop) => boolean;
}): {
    track: (promise: PromiseLike<unknown>) => void;
    finish: (loop: Loop) => Promise<void>;
    releaseName: (name?: string) => void;
    release: (loop: Loop) => void;
    clear: () => void;
};

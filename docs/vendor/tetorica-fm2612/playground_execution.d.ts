export type PlaygroundExecutionGuardOptions = {
    enabled?: boolean;
};
/**
 * @typedef {{
 *   enabled?: boolean,
 * }} PlaygroundExecutionGuardOptions
 */
/**
 * Temporarily block network/navigation APIs in a realm; nested installations share guards.
 * @param {typeof globalThis} [realm=globalThis] Realm to patch.
 * @param {PlaygroundExecutionGuardOptions} [options={}] Whether guards are enabled.
 * @returns {() => void} Idempotent release function that restores APIs after the final owner releases.
 */
export declare function installPlaygroundExecutionGuards(realm?: typeof globalThis, options?: PlaygroundExecutionGuardOptions): () => void;
/**
 * Run a callback with guards, restoring the realm even when the callback rejects.
 * @template T
 * @param {() => T | PromiseLike<T>} callback Work to execute.
 * @param {typeof globalThis} [realm=globalThis] Realm to patch.
 * @param {PlaygroundExecutionGuardOptions} [options={}] Guard settings.
 * @returns {Promise<Awaited<T>>} Callback result.
 */
export declare function executeWithPlaygroundGuards<T>(callback: () => T | PromiseLike<T>, realm?: typeof globalThis, options?: PlaygroundExecutionGuardOptions): Promise<Awaited<T>>;

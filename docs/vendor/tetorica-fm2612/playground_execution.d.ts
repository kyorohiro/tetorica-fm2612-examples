/**
 * Snapshot Tauri's authenticated IPC endpoint before user code starts. The
 * returned capability does not expose fetch and accepts no ordinary network
 * URLs. Tauri still validates its private invoke key and command permissions.
 * @param {typeof globalThis} [realm=globalThis] Trusted application realm.
 * @returns {object | null} Opaque capability for the execution guard, or null outside Tauri.
 */
export declare function capturePlaygroundNativeIpc(realm?: typeof globalThis): object | null;
export type PlaygroundExecutionGuardOptions = {
    enabled?: boolean;
    nativeIpc?: object | null;
};
/**
 * @typedef {{
 *   enabled?: boolean,
 *   nativeIpc?: object | null,
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

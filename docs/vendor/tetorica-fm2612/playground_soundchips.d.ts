/** Per-runtime lookup cache. Creation and Stop disposal remain owned by the runtime. */
/**
 * Create a chip cache that coalesces concurrent requests and invalidates stopped generations.
 * @returns Cached use and clear operations. use rejects unsupported chips/nonempty options;
 * clear invalidates pending lookups but does not dispose resolved chips.
 */
export declare function createSoundChipRegistry(): {
    /** @template {{dispose?: () => void}} Chip
     * @param {string} name Supported Playground chip name.
     * @param {Record<string, never> | undefined} options Omit or pass an empty object.
     * @param {(name: string) => Chip | PromiseLike<Chip>} resolve Chip factory owned by the runtime.
     * @param {{evictOnDispose?: boolean}} [settings] Remove manually disposed extra clients from the cache.
     * @returns {Promise<Chip>} Shared pending/resolved chip. */
    use<Chip extends {
        dispose?: () => void;
    }>(name: string, options: Record<string, never> | undefined, resolve: (name: string) => Chip | PromiseLike<Chip>, { evictOnDispose }?: {
        evictOnDispose?: boolean;
    }): Promise<Chip>;
    clear(): void;
};

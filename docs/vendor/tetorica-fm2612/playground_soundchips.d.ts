/** Per-runtime lookup cache. Creation and Stop disposal remain owned by the runtime. */
export declare function createSoundChipRegistry(): {
    use(name: any, options: any, resolve: any, { evictOnDispose }?: {
        evictOnDispose?: boolean | undefined;
    }): any;
    clear(): void;
};

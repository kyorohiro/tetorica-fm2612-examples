/** Browser/Worker PCM playback controls. Loading/decoding is injected separately.
 * AudioWorklet acknowledges preparation directly; playback never needs a UI reply.
 */
export declare function createNativeSampleController(send: any): {
    accept(d: any): void;
    load(name: any, pcm: any): Promise<{
        name: any;
        length: any;
        sampleRate: any;
        numberOfChannels: any;
        duration: number;
    }>;
    /** Negative playbackRate reads backward. Offset counts from the playback start
     * (the end for reverse); duration counts source seconds, loops use original-file bounds. */
    play(name: any, options?: {}): Promise<{
        name: any;
        stop: () => any;
    }>;
    stop(name: any): void;
    stopAll(): void;
    unload(name: any): boolean;
    isLoaded: (name: any) => boolean;
    get: (name: any) => any;
    list: () => any[];
    invalidate(): void;
};
/** Convert a decoded AudioBuffer into copyable planar PCM without detaching it. */
export declare function samplePCM(buffer: any): {
    sampleRate: any;
    channels: any[];
};

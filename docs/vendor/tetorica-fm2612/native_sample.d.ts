/** Browser/Worker PCM playback controls. Loading/decoding is injected separately.
 * AudioWorklet acknowledges preparation directly; playback never needs a UI reply.
 */
/** @param {(message:Record<string,unknown>)=>void} send Ordered transport sender.
 * @returns PCM bank/voice controls and acknowledgement handling; preparation promises await Worklet replies. */
export declare function createNativeSampleController(send: (message: Record<string, unknown>) => void): {
    accept(d: any): void;
    /** @param {string} name
     * @param {import('./wav.js').ChannelPCM} pcm */
    load(name: string, pcm: import('./wav.js').ChannelPCM): Promise<{
        name: string;
        length: number;
        sampleRate: number;
        numberOfChannels: number;
        duration: number;
    }>;
    /** Negative playbackRate reads backward. Offset counts from the playback start
     * (the end for reverse); duration counts source seconds, loops use original-file bounds.
     * fadeIn/fadeOut are output seconds; fadeOut applies at a bounded natural end and on stop. */
    /** @param {string} name
     * @param {import('./megasynth.js').MegaSynthSamplePlayOptions} [options] */
    play(name: string, options?: import('./megasynth.js').MegaSynthSamplePlayOptions): Promise<{
        name: string;
        stop: () => void;
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
/** @param {AudioBuffer} buffer
 * @returns {import("./wav.js").ChannelPCM} */
export declare function samplePCM(buffer: AudioBuffer): import("./wav.js").ChannelPCM;

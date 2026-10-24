/** Control-side metadata only. The audio callback publishes two counters, never
 * sample RAM. A CPU data write invalidates the uploaded waveform immediately. */
export declare function createNativeY8950AdpcmInspection(): {
    applied(state: any, candidate: any): void;
    adopt(inspector: any, state: any): void;
    reset(): void;
};
/** UI uploads bypass script/loop authoring hooks. Decoding and encoding stay on
 * the control side; every stage retains the selected Native connection. */
export declare function createNativeY8950SampleLoader({ context, read, invoke, transport, decodeAudio }: {
    context: any;
    decodeAudio: any;
    invoke: any;
    read: any;
    transport: any;
}): (source: any, options?: {}) => Promise<{
    start: number;
    end: number;
    frames: number;
    paddedFrames: number;
    deltaN: number;
    sampleRate: number;
    duration: number;
    name: string;
    source: string;
    preview: {
        start: number;
        end: number;
        frames: number;
        name: string;
        source: string;
        waveform: number[];
    } | null;
    clock: any;
}>;

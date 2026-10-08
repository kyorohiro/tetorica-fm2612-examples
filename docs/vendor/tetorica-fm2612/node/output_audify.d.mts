/** Optional Node Worker output adapter. Requires audify 1.10.x, loaded only here. */
export declare function createOutput({ sampleRate, bufferFrames, onDrain, onError, moduleUrl, deviceId }: {
    bufferFrames: any;
    deviceId: any;
    moduleUrl: any;
    onDrain: any;
    onError: any;
    sampleRate: any;
}): Promise<{
    frames: any;
    readonly queuedFrames: number;
    write({ left, right }: {
        left: any;
        right: any;
    }): void;
    start(): void;
    stop(): void;
    getState(): {
        api: any;
        consumedFrames: number;
        queuedFrames: number;
        bufferFrames: any;
        deviceLatencyFrames: any;
    };
    close(): void;
}>;

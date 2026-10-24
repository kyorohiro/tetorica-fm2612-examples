export declare function createNativeGenesisMonitor({ invoke, getSession, getSampleRate, isReady }: {
    getSampleRate: any;
    getSession: any;
    invoke: any;
    isReady: any;
}): {
    backend: string;
    isReady: any;
    getSession: any;
    read({ mode, channel }: {
        channel: any;
        mode: any;
    }): Promise<{
        session: any;
        frame: any;
        sampleRate: any;
        frames: any;
        rms: any;
        peak: any;
    } | null>;
    pause(): any;
};

/** Explicit Sample Editor preparation/preview. No live Web Audio output node. */
export declare function createNativeSampleEditorAudio(synth: any, { decodeAudio }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
}): {
    decodeAudio(bytes: any): Promise<{
        sampleRate: any;
        channels: Float32Array<any>[];
    }>;
    /** @param {import('./wav.js').ChannelPCM & {loopEnabled?:boolean,loopStartFrame:number,loopEndFrame:number}} rendered
     * @param {{signal?:AbortSignal}} [options] */
    playPreview(rendered: import('./wav.js').ChannelPCM & {
        loopEnabled?: boolean;
        loopStartFrame: number;
        loopEndFrame: number;
    }, { signal }?: {
        signal?: AbortSignal;
    }): Promise<{
        stop: () => any;
    }>;
    stop(): Promise<void>;
};

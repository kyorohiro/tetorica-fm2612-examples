/** Audition the same declared MIDI-root key as the instrument's Keyboard route.
 * baseFrequencyHz includes cents metadata, so setting the root MIDI note applies
 * the same cents compensation as subsequent Keyboard notes. At zero cents the
 * hardware pitch is 4096. Voice level .75 matches the default sample instrument.
 * A short endpoint fade affects only this disposable preview, not source/ADPCM.
 * The caller supplies the actual generated WASM factory and options.
 * @param {any} audio
 * @param {any} [settings]
 * @param {{moduleFactory:Function,moduleOptions?:any,maxBytes?:number}} [options]
 */
export declare function renderPs1SamplePreview(audio: any, settings?: any, { moduleFactory, moduleOptions, maxBytes }?: {
    moduleFactory: Function;
    moduleOptions?: any;
    maxBytes?: number;
}): Promise<{
    adpcm: Uint8Array;
    sourceFrames: number;
    frames: number;
    paddingFrames: number;
    blockCount: number;
    loopStartSamples: number | null;
    metrics: {
        rmsError: number;
        maxError: number;
        signalRms: number;
        snrDb: number | null;
        errorFrames: number;
        exact: boolean;
    };
    rootMidi: number;
    tuneCents: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    peakBeforeClip: number;
    clippedSamples: number;
    baseFrequencyHz: number;
    alignment: {
        blockFrames: number;
        changed: any;
        requested: {
            startFrame: number;
            endFrame: number;
        };
        applied: {
            startFrame: number;
            endFrame: number;
        };
        discardedTailFrames: number;
    };
    channels: Float32Array<ArrayBuffer>[];
    sampleRate: number;
    durationSeconds: number;
    frequencyHz: number;
    sourceFrequencyHz: number;
    pitch: number;
    outputGain: number;
    sampleLoopEnabled: any;
    sampleLoopStartFrame: number;
    sampleLoopEndFrame: number;
    loopEnabled: boolean;
    loopStartFrame: number;
    loopEndFrame: number;
}>;

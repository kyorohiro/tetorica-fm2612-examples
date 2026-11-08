/** Render edited mono PCM at 44,100 Hz, then encode complete SPU packets.
 * Root MIDI and cents describe the input frequency at hardware PITCH 4096;
 * they never resample the recording. All edit positions refer to original PCM.
 *
 * Loop boundaries are first converted to native-rate crop-relative frames,
 * then moved INWARD to 28-frame packet boundaries. The complete intro before
 * the loop is retained; data after the applied loop end is omitted. A loop
 * with no complete packet is rejected. Requested/applied positions are always
 * returned, even when equal, so the caller can explain alignment explicitly.
 * One-shots retain every edited frame and zero-pad their last ADPCM packet.
 *
 * maxBytes is the available contiguous sample-RAM budget, not total SPU RAM.
 * The whole edited selection must fit that budget before resampling, even when
 * its loop end would discard a long tail. This bounds the temporary native-rate
 * PCM allocation; the caller can shorten the selection without losing source.
 * Oversized results are rejected before encoding and never silently truncated.
 * Channels, ADPCM and decodedChannels are independent owned copies.
 * @param {any} audio
 * @param {any} [settings]
 * @param {{maxBytes?:number}} [options]
 */
export declare function renderPs1Sample(audio: any, settings?: any, options?: {
    maxBytes?: number;
}): {
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
    sampleRate: number;
    loopEnabled: any;
    rootMidi: number;
    tuneCents: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    peakBeforeClip: number;
    clippedSamples: number;
    channels: any[];
    baseFrequencyHz: number;
    loopStartFrame: number;
    loopEndFrame: number;
    decodedChannels: Float32Array<ArrayBuffer>[];
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
};
/** Bounded display payload: no full PCM, ADPCM or source-buffer aliases.
 * The source display spans the actual encoded (possibly loop-trimmed) PCM;
 * decoded display includes the final one-shot packet's explicit zero padding.
 */
export declare function renderPs1SampleComparison(audio: any, settings?: {}, options?: {}): {
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
    sampleRate: number;
    loopEnabled: any;
    rootMidi: number;
    tuneCents: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    peakBeforeClip: number;
    clippedSamples: number;
    baseFrequencyHz: number;
    loopStartFrame: number;
    loopEndFrame: number;
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
    sourceDisplay: Float32Array<ArrayBuffer>;
    decodedDisplay: Float32Array<ArrayBuffer>;
    sourceFrameCount: any;
    decodedFrameCount: number;
    byteLength: number;
};

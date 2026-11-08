/** Default space available to BRR samples in an otherwise empty SnesSynth. */
export declare const DEFAULT_BRR_MAX_BYTES = 64512;
/** Convert normalized mono Float32 PCM to complete 9-byte BRR blocks.
 * Input values must be finite and in [-1, 1]; samples are never clipped or
 * normalized before encoding. The input and loop marker use the same sample
 * units as the output: this function performs no sample-rate conversion.
 *
 * One-shots are explicitly zero-padded to 16 samples. Loops require an already
 * aligned input length and an aligned, in-bounds loopStartSamples. Filter 0 at
 * both the first and loop-start blocks makes those blocks independent of the
 * incoming predictor history. Later blocks choose the smallest block error
 * among filters 0..3 and shifts 0..12 using greedy, exhaustive nibble search.
 * Ties prefer the first filter, shift and signed nibble in ascending order.
 *
 * The output is bounded to one 64-KiB RAM image; maxBytes defaults to the
 * 64,512 bytes available in an empty SnesSynth. Callers using a SnesSynth with
 * existing samples or a different directory layout must manage its remaining
 * RAM budget. Capacity checks happen before encoding, and oversized input is
 * rejected rather than truncated.
 *
 * Metrics compare original input frames with exact reconstructed raw BRR PCM
 * before S-DSP interpolation/envelopes. Padding is excluded. rmsError,
 * maxError and signalRms use normalized PCM units. snrDb is null for an exact
 * match or a zero signal; exact distinguishes a lossless reconstruction. All
 * metrics can be saved as JSON. frames is the encoded length; paddingFrames
 * is the number of added zeros.
 *
 * @param {Float32Array} pcm
 * @param {{loopStartSamples?:number|null,maxBytes?:number}} [options]
 * @returns {{brr:Uint8Array,sourceFrames:number,frames:number,paddingFrames:number,
 *   blockCount:number,loopStartSamples:number|null,
 *   metrics:{rmsError:number,maxError:number,snrDb:number|null,signalRms:number,errorFrames:number,exact:boolean}}}
 */
export declare function encodeBrr(pcm: Float32Array, options?: {
    loopStartSamples?: number | null;
    maxBytes?: number;
}): {
    brr: Uint8Array;
    sourceFrames: number;
    frames: number;
    paddingFrames: number;
    blockCount: number;
    loopStartSamples: number | null;
    metrics: {
        rmsError: number;
        maxError: number;
        snrDb: number | null;
        signalRms: number;
        errorFrames: number;
        exact: boolean;
    };
};

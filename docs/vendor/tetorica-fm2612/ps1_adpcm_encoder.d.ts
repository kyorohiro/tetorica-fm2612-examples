/** Space available to sample uploads in an otherwise empty Ps1Synth. */
export declare const DEFAULT_PS1_ADPCM_MAX_BYTES: number;
/** Convert normalized mono Float32 PCM to 16-byte / 28-frame SPU packets.
 * Input values must be finite in [-1, 1]. Conversion neither clips nor rounds
 * input PCM to int16 first; quantization error therefore includes that step.
 * Input frames and loop positions are source-sample units, with no resampling.
 *
 * One-shots are explicitly zero-padded to a complete packet. Loops require an
 * already aligned length and aligned, in-bounds loopStartSamples. Filter 0 at
 * the first and loop-start packets makes entry independent of decoder history.
 * All later packets search filters 0..4 and shifts 0..12 for the smallest sum
 * of raw squared reconstruction errors. Each candidate greedily selects the
 * nearest admissible signed nibble, exactly equivalent to searching -8..7.
 * Equal errors prefer ascending filter, shift, then signed nibble.
 *
 * The native decoder wraps overflowing sums to signed short. This encoder
 * deliberately excludes every nibble with an overflowing unwrapped sum; an
 * entire candidate is rejected if it has no admissible nibble at any frame.
 * Filter 0 always supplies a valid fallback. Thus it cannot exploit wraparound
 * for a superficially smaller error, and its metrics match actual decoding.
 * Quantization is greedy within a packet, not a global optimal-path search.
 *
 * maxBytes defaults to the 520,192 bytes available in an empty Ps1Synth. An
 * explicit raw-RAM budget may be at most 512 KiB. Callers must subtract space
 * already allocated in their Synth. Capacity is checked before encoding;
 * oversized input is rejected, never truncated. Output plus fixed packet
 * scratch arrays are allocated; no full-size PCM copy is needed.
 *
 * Metrics compare original frames with reconstructed raw int16 PCM / 32768,
 * before interpolation, envelopes and effects; zero padding is excluded.
 * rmsError, maxError and signalRms use normalized PCM units. snrDb is null for
 * an exact match or zero signal. exact distinguishes lossless reconstruction.
 * Metrics are JSON-safe. frames includes padding; sourceFrames does not.
 *
 * @param {Float32Array} pcm
 * @param {{loopStartSamples?:number|null,maxBytes?:number}} [options]
 * @returns {{adpcm:Uint8Array,sourceFrames:number,frames:number,paddingFrames:number,
 *   blockCount:number,loopStartSamples:number|null,
 *   metrics:{rmsError:number,maxError:number,signalRms:number,snrDb:number|null,errorFrames:number,exact:boolean}}}
 */
export declare function encodePs1Adpcm(pcm: Float32Array, options?: {
    loopStartSamples?: number | null;
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
};
/** Encode the editor's four-packet cycle using the previous cycle as history.
 * General recordings keep the independent entry points of encodePs1Adpcm().
 * The SPU builds its 112-frame loop cache from the first decode's final state.
 * Score that actual second pass, rejecting signed-short overflow on either
 * pass. Keep the original encoding if prediction would make the loop worse.
 * This is prepare-side work only; no encoding runs during audio rendering.
 * @param {Float32Array} pcm
 */
export declare function encodePs1AdpcmCycle(pcm: Float32Array): {
    adpcm: Uint8Array<ArrayBuffer>;
    sourceFrames: number;
    frames: number;
    paddingFrames: number;
    blockCount: number;
    loopStartSamples: any;
    metrics: {
        rmsError: number;
        maxError: number;
        signalRms: number;
        snrDb: number | null;
        errorFrames: number;
        exact: boolean;
    };
};

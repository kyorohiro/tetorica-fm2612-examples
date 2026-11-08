/** Browser / Worker / Node: bounded mono PCM to Yamaha ADPCM-A conversion.
 * This is ADPCM-A sample data for YM2610/YM2610B, not ADPCM-B or PCM WAV.
 * No resampling, gain normalization, pitch inference or looping is performed.
 */
/** Encode normalized mono Float32 PCM as complete 256-byte ADPCM-A units.
 *
 * Input values must be finite and in [-1, 1]. The caller must supply PCM at
 * the chip's ADPCM-A playback rate: this function does not resample. ADPCM-A
 * has no stored sample rate or tuning metadata. At the standard 8 MHz YM2610
 * clock the decoded rate is clock / 432 (approximately 18,518.5 Hz).
 *
 * Each sample searches all 16 nibbles, choosing the smallest squared error
 * against the exact reconstructed signed 12-bit predictor divided by 2048.
 * Ties prefer the lower unsigned nibble. The predictor starts at zero, the
 * step index starts at zero, high nibbles come first, and accumulator overflow
 * wraps to 12 bits rather than clipping. These are ADPCM-A decoder rules;
 * ADPCM-B uses a different codec and cannot play these bytes.
 *
 * Padding to a 256-byte (512-frame) address unit is explicitly encoded toward
 * zero with the same predictor state. Zero-filled compressed bytes would not
 * produce silence. Even encoded zero PCM has a small quantization error.
 * The caller must stop playback at the encoded end; padding is not a loop.
 *
 * maxBytes defaults to 0xfff00 and is limited to that per-sample size by the
 * current YM2610BAdpcmASynth.setSample API. This is independent of the chip's
 * total ROM allocation and caller-managed sample bank placement. Capacity is
 * checked before encoding; input is never truncated or modified. Runtime is
 * linear in encoded frames and working memory is bounded apart from output.
 *
 * frames includes padding; sourceFrames and paddingFrames describe its size.
 * Metrics use the original input frames only, in normalized PCM units, before
 * chip attenuation, mixing or sample-rate conversion. snrDb is null for exact
 * reconstruction or a zero input signal; exact distinguishes those cases.
 * All metrics are finite numbers or null and can be stored as JSON.
 *
 * @param {Float32Array} pcm Normalized finite mono PCM, at the intended playback rate.
 * @param {{maxBytes?:number}} [options]
 * @returns {{bytes:Uint8Array,sourceFrames:number,frames:number,paddingFrames:number,
 *   metrics:{rmsError:number,maxError:number,signalRms:number,snrDb:number|null,errorFrames:number,exact:boolean}}}
 */
export declare function encodeAdpcmA(pcm: Float32Array, options?: {
    maxBytes?: number;
}): {
    bytes: Uint8Array;
    sourceFrames: number;
    frames: number;
    paddingFrames: number;
    metrics: {
        rmsError: number;
        maxError: number;
        signalRms: number;
        snrDb: number | null;
        errorFrames: number;
        exact: boolean;
    };
};

export declare const MSM5205_MAX_SAMPLE_BYTES = 65536;
/** Decode and encode a short mono/stereo sample for the PCE's ADPCM player.
 * rate is the hardware register 0..15, not Hz: clock / (48 * (16 - rate)).
 * Channels are averaged, linearly resampled and greedily encoded high nibble
 * first. An odd final frame is padded by one encoded zero-target frame.
 * @param {unknown} source PCM, AudioBuffer, WAV bytes or Blob; other byte formats require decodeAudio.
 * @param {{rate?:number,clock?:number,decodeAudio?:(bytes:ArrayBuffer)=>Promise<unknown>,signal?:AbortSignal}} [options]
 */
export declare function prepareMSM5205Sample(source: unknown, { rate, clock, decodeAudio, signal }?: {
    rate?: number;
    clock?: number;
    decodeAudio?: (bytes: ArrayBuffer) => Promise<unknown>;
    signal?: AbortSignal;
}): Promise<{
    data: Uint8Array<ArrayBuffer>;
    rate: number;
    sampleRate: number;
    frames: number;
    paddedFrames: number;
    duration: number;
}>;

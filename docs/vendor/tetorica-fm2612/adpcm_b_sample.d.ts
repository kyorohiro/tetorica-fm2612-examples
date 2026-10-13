/** Browser / Worker / Node: decode PCM WAV and encode Yamaha ADPCM-B.
 * No AudioContext is created. Other formats can use an injected decodeAudio.
 */
/** @param {unknown} source @param {{signal?: AbortSignal, decodeAudio?: (bytes: ArrayBuffer) => Promise<AudioBuffer | import("./wav.js").ChannelPCM>}} [options] */
export declare function readSamplePCM(source: unknown, { signal, decodeAudio }?: {
    signal?: AbortSignal;
    decodeAudio?: (bytes: ArrayBuffer) => Promise<AudioBuffer | import("./wav.js").ChannelPCM>;
}): Promise<{}>;
/** Greedy encoder matching ymfm ADPCM-B: high nibble first, signed 16-bit
 * predictor, initial step 127 and Yamaha's multiplicative step adjustment.
 * Linear interpolation handles rate conversion; pad with encoded silence to
 * the chip's 32-byte addressing boundary (64 decoded frames).
 * @param {import('./wav.js').ChannelPCM} pcm Mono/multichannel PCM; channels are averaged before encoding.
 * @param {number} outputRate Target decoded samples per second.
 * @param {number} [maxBytes=0x200000] Maximum encoded size in bytes.
 * @returns Encoded ADPCM-B bytes and playback metadata.
 */
export declare function encodeAdpcmB({ channels, sampleRate }: import('./wav.js').ChannelPCM, outputRate: number, maxBytes?: number): {
    bytes: Uint8Array<ArrayBuffer>;
    frames: number;
    paddedFrames: number;
    sampleRate: number;
};

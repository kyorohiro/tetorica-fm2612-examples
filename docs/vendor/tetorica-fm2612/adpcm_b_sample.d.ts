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
 */
export declare function encodeAdpcmB({ channels, sampleRate }: {
    channels: any;
    sampleRate: any;
}, outputRate: any, maxBytes?: number): {
    bytes: Uint8Array<ArrayBuffer>;
    frames: number;
    paddedFrames: number;
    sampleRate: any;
};

export type StereoPCM = {
    sampleRate: number;
    left: Float32Array;
    right?: Float32Array;
};
export type ChannelPCM = {
    sampleRate: number;
    channels: Float32Array[];
};
/** Browser / Worker / Node: decoded mono/stereo PCM -> PCM16 RIFF WAV bytes.
 * Does not create AudioContext, save a file or play audio.
 */
/** @typedef {{sampleRate: number, left: Float32Array, right?: Float32Array}} StereoPCM */
/** @typedef {{sampleRate: number, channels: Float32Array[]}} ChannelPCM */
/** @param {StereoPCM | ChannelPCM | AudioBuffer} pcm @param {{gain?: number}} [options] */
export declare function encodeWav(pcm: StereoPCM | ChannelPCM | AudioBuffer, { gain }?: {
    gain?: number;
}): Uint8Array<ArrayBuffer>;

/** @param {Uint8Array|ArrayBuffer} value
 * @returns {Uint8Array} */
export declare function sampleBytes(value: Uint8Array | ArrayBuffer): Uint8Array;
/** Convert decoded mono/stereo PCM to sign-magnitude RAM bytes, with a loop marker. */
/** @param {import("./wav.js").ChannelPCM} pcm
 * @returns {{bytes:Uint8Array,step:number,frames:number}} */
export declare function encodeRf5c164({ channels, sampleRate }: import("./wav.js").ChannelPCM): {
    bytes: Uint8Array;
    step: number;
    frames: number;
};

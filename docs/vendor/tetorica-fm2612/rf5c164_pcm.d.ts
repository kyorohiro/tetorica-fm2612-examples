export declare function sampleBytes(value: any): Uint8Array<ArrayBufferLike>;
/** Convert decoded mono/stereo PCM to sign-magnitude RAM bytes, with a loop marker. */
export declare function encodeRf5c164({ channels, sampleRate }: {
    channels: any;
    sampleRate: any;
}): {
    bytes: Uint8Array<any>;
    step: number;
    frames: any;
};

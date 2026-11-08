export declare const PS1_WAVEFORM_FRAMES = 112;
export declare const PS1_WAVEFORM_BYTES = 64;
export declare const PS1_WAVEFORM_FREQUENCY_HZ: number;
/** @param {Float32Array|number[]} input */
export declare function preparePs1Waveform(input: Float32Array | number[]): {
    pcm: number[];
    adpcm: Uint8Array<ArrayBuffer>;
};

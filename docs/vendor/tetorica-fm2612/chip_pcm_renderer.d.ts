/** Shared sample-rate conversion for chip output transports. No audio device. */
export declare class ChipPCMRenderer {
    chip: {
        sampleRate(): number;
        generateStereo(frames: number): {
            left: Float32Array;
            right: Float32Array;
        };
    };
    rate: number;
    sampleRate: number;
    gain: number;
    generate: any;
    idleLeft: number;
    idleRight: number;
    phase: number | undefined;
    left: number | undefined;
    right: number | undefined;
    /** @param {{sampleRate(): number, generateStereo(frames: number): {left: Float32Array, right: Float32Array}}} chip @param {{sampleRate: number, gain?: number, generate?: (frames: number) => {left: Float32Array, right: Float32Array}, removeIdleOffset?: boolean}} options */
    constructor(chip: {
        sampleRate(): number;
        generateStereo(frames: number): {
            left: Float32Array;
            right: Float32Array;
        };
    }, { sampleRate, gain, generate, removeIdleOffset }?: {
        sampleRate: number;
        gain?: number;
        generate?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        removeIdleOffset?: boolean;
    });
    resetHistory(): void;
    render(frames: any): {
        left: Float32Array<any>;
        right: Float32Array<any>;
        sampleRate: number;
    };
    /** Fill an output span without allocating PCM arrays on the audio thread.
     * @param {Float32Array} left @param {Float32Array} right
     * @param {number} [outputOffset] @param {number} [frames] */
    renderInto(left: Float32Array, right: Float32Array, outputOffset?: number, frames?: number): void;
}

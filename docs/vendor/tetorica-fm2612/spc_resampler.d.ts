/** Native SPC stereo frames are always 32,000 Hz. Linear interpolation keeps its
 * phase across output quanta and pause. File playback batches 128 native frames;
 * a directly controlled DSP can select sourceFrames:1 to limit render-ahead.
 * Linear interpolation still holds the next native sample for interpolation.
 */
export declare class SpcResampler {
    core: any;
    outputRate: any;
    sourceFrames: number;
    left: Float32Array<ArrayBuffer>;
    right: Float32Array<ArrayBuffer>;
    offset: number | undefined;
    primed: boolean | undefined;
    phase: number | undefined;
    outputFrames: number | undefined;
    baseNativeFrames: number | undefined;
    renderedNativeFrames: number | undefined;
    pulledLeft: any;
    pulledRight: number | undefined;
    previousLeft: any;
    previousRight: number | undefined;
    nextLeft: any;
    nextRight: number | undefined;
    constructor(core: any, outputRate: any, { sourceFrames }?: {
        sourceFrames?: number | undefined;
    });
    reset(nativeFrames?: number): void;
    pull(): void;
    get playbackNativeFrames(): number;
    render(left: any, right: any): void;
}

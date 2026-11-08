/** Streaming linear conversion from fixed 44.1-kHz PCM to a host rate.
 * Phase survives output quanta. Native batches contain only the frames needed
 * by the current output segment, bounding look-ahead to its interpolation
 * endpoint; 44.1-kHz output delegates directly
 * without look-ahead. Call reset() after the source is stopped/reset, so held
 * interpolation frames cannot leak into the next transport run.
 */
export declare class Pcm44100Resampler {
    core: {
        renderInto: Function;
        nativeFrames?: number;
        sampleRate?: number;
    };
    outputRate: number;
    sourceFrames: number;
    left: Float32Array<ArrayBuffer>;
    right: Float32Array<ArrayBuffer>;
    offset: number | undefined;
    availableFrames: number | undefined;
    remainingPulls: number | undefined;
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
    /** @param {{renderInto:Function,nativeFrames?:number,sampleRate?:number}} core
     * @param {number} outputRate @param {{sourceFrames?:number}} [options] */
    constructor(core: {
        renderInto: Function;
        nativeFrames?: number;
        sampleRate?: number;
    }, outputRate: number, { sourceFrames }?: {
        sourceFrames?: number;
    });
    /** @param {number} [nativeFrames] */
    reset(nativeFrames?: number): void;
    _pull(): void;
    get playbackNativeFrames(): number;
    /** Render without allocating per output quantum. Destinations must be separate
     * Float32 ranges; validation precedes any source advancement.
     * @param {Float32Array} left @param {Float32Array} right
     * @param {number} [frames] @param {number} [offset] */
    render(left: Float32Array, right: Float32Array, frames?: number, offset?: number): void;
}

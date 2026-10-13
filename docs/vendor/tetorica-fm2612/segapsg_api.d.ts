export { psgPeriodFromFrequency, psgPeriodFromNote } from './segapsgsynth.js';
/** Existing Playground callers keep bound methods and their injected transport. */
/** @param {{clock?:number, write: (value: number) => void, reset?: () => void, resetAll?: () => void}} transport Ordered register sender.
 * @returns Bound SegaPSGSynth tone/noise, attenuation and reset methods. */
export declare function createSegaPsgApi(transport: {
    clock?: number;
    write: (value: number) => void;
    reset?: () => void;
    resetAll?: () => void;
}): {
    [k: string]: any;
};

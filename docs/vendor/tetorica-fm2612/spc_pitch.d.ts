/** Estimate an acoustic reference at native 32,000 Hz / raw PITCH 4096.
 * BRR contains no musical root note; octave errors and complex/noisy samples
 * remain possible. Only high confidence is suitable for an automatic default.
 * Low confidence returns a candidate for inspection; none returns null.
 * Search range is about 31.25–8,000 Hz, with at most three 4096-frame windows.
 * Decoder work is capped separately; loop predictor history is carried across
 * warm-up passes, rather than resetting each repetition to zero.
 * @param {{brr:ArrayBuffer|ArrayBufferView,loop?:boolean,loopStartSamples?:number|null}} sample
 * @returns {{referenceHz:number|null,confidence:'high'|'low'|'none',reason:string,method:string}}
 */
export declare function estimateBrrPitch(sample: {
    brr: ArrayBuffer | ArrayBufferView;
    loop?: boolean;
    loopStartSamples?: number | null;
}): {
    referenceHz: number | null;
    confidence: 'high' | 'low' | 'none';
    reason: string;
    method: string;
};

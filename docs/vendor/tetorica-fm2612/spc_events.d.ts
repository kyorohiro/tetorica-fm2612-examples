/** Musical observations of S-DSP register writes, in Browser / Worker / Node.
 *
 * These are key requests and parameter changes, not a transcription of the
 * internal envelope or a guarantee that a voice is audible. In particular,
 * initial notes are inferred from KON/ENVX/OUTX and the persistent KOFF mask.
 * BRR contents and musical root notes cannot be inferred from DSP registers.
 * No control quantization, smoothing, pitch conversion or RAM copies are done.
 */
export declare const SPC_EVENT_CLOCK_RATE = 1024000;
/** Decode an ordered stream of flat [clock, register, value] triples.
 * Clocks are nonnegative safe integers in 1,024,000-Hz SPC clock units, NOT
 * 32,000-Hz PCM frames. Float64Array supports songs longer than 2^32 clocks.
 *
 * Consecutive same-clock PITCH low/high, volume and instrument writes are
 * combined; a key/global write is an ordering boundary. Every asserted KON
 * write emits noteOn, including repeated masks. keyOffHeld marks a simultaneous
 * persistent KOFF, which can prevent a sustained note. KOFF release requests
 * are emitted on newly asserted bits or currently held notes; clearing KOFF
 * alone does not start a note. Initial inferred notes include complete presets.
 *
 * A finite flush/watermark commits ONLY clocks strictly below that watermark,
 * so a same-clock PITCH pair may straddle batches. flush(Infinity) completes the
 * last group. At most 8,192 writes are accepted per call; callers stream larger
 * captures in chunks. No raw write history is retained. Filters affect output,
 * never the internal DSP/held-note state. Global dsp events bypass channels.
 *
 * @param {{dsp:Uint8Array,startClock?:number,channels?:number[],types?:string[],includeInitial?:boolean}} options
 */
export declare function createSpcEventDecoder({ dsp, startClock, channels, types, includeInitial }?: {
    dsp: Uint8Array;
    startClock?: number;
    channels?: number[];
    types?: string[];
    includeInitial?: boolean;
}): {
    pushWrites: (writes: any, watermarkClock: any) => any[];
    flush: (clock?: number) => any[];
    reset: (nextDsp: any, clock?: number) => void;
    snapshot: () => any;
};
/** Interpret DSP records from a full SPC timeline. RAM records are deliberately
 * ignored: extract BRR versions from the appropriate RAM snapshot separately.
 * This convenience method retains the output array (up to maxEvents); streaming
 * observation should use createSpcEventDecoder directly instead.
 * @param {{version:number,clockRate:number,initialState:{dsp:Uint8Array},events:Uint32Array|number[]}} trace
 */
export declare function convertSpcTraceEvents(trace: {
    version: number;
    clockRate: number;
    initialState: {
        dsp: Uint8Array;
    };
    events: Uint32Array | number[];
}, { maxEvents, ...options }?: {
    maxEvents?: number | undefined;
}): any[];

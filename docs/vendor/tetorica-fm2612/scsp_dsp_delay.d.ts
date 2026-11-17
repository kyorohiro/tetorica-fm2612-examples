export declare const SCSP_DSP_DELAY_RAM_BYTES = 65536;
export declare const SCSP_DSP_DELAY_ALIGNMENT = 8192;
/** Resolve explicit Delay settings to the codes used by the fixed SCSP DSP. */
export declare function resolveScspDspDelay(patch: any, previous?: Readonly<{
    enabled: false;
    timeMs: 240;
    feedback: 0.35;
}>): {
    enabled: any;
    timeMs: any;
    feedback: number;
};
/** RBP advances by 4096 words. The owned ring contains 32768 packed words. */
export declare function validateScspDspDelayRam(reservation: any): {
    address: any;
    byteLength: number;
};
/** Original six-step mono Delay, shared with the existing Synth's reference. */
export declare function createScspDspDelayProgram(): Uint16Array<ArrayBuffer>;
/** Packed SCSP floating-point zero is 0x6000 in the core's big-endian RAM. */
export declare function createScspDspDelaySilence(): Uint8Array<ArrayBuffer>;

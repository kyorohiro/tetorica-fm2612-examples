export declare class Msm5205AudioEngine {
    clock: number;
    flags: number;
    rate: number;
    muted: boolean;
    volume: number | undefined;
    signal: number | undefined;
    step: number | undefined;
    phase: number | undefined;
    resetLine: any;
    vclk: any;
    prescaler: number | undefined;
    bits: number | undefined;
    fifo: any[] | undefined;
    /** @param {{clock:number,flags?:number,outputSampleRate?:number,masterVolume?:number}} options Chip clock in Hz and output frames per second. */
    constructor({ clock, flags, outputSampleRate, masterVolume }?: {
        clock: number;
        flags?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    });
    sampleRate(): number;
    setMasterVolume(value: any): number;
    getMasterVolume(): number | undefined;
    setMsm5205Muted(value: any): void;
    reset(): void;
    dispose(): void;
    divider(): number;
    decode(): void;
    writeMsm5205(register: any, value: any): void;
    processFrames(frames: any): {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
}
export declare function attachMsm5205(engine: any, msm: any): void;

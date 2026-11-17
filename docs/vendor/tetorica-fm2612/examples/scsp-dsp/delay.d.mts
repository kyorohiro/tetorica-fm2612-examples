/** Render an original short note and its hardware-DSP echoes without a device. */
export declare function runDelayExample(): Promise<{
    sampleRate: number;
    held: any;
    tail: any;
    tailPeak: any;
    pcmUnchanged: true;
    delay: any;
    ram: any;
    source: string;
}>;

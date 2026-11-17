/** Render both effects from the installed package, with an independent reference. */
export declare function runDspExamples(): Promise<{
    sampleRate: number;
    gain: {
        kind: any;
        source: string;
        frames: any;
        coefficients: number[];
        actual: any;
        reference: Float32Array<ArrayBuffer>;
        exact: any;
        maxError: any;
        ramUnchanged: true;
        peak: any;
    };
    iir: {
        kind: any;
        source: string;
        frames: any;
        coefficients: number[];
        actual: any;
        reference: Float32Array<ArrayBuffer>;
        exact: any;
        maxError: any;
        ramUnchanged: true;
        peak: any;
    };
}>;

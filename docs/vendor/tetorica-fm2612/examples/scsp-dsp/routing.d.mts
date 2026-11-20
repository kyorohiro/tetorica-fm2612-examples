export declare const routingSource = "\n; MIXS0 -> Gain -> EFREG0; MIXS1 -> IIR -> EFREG1.\n000: XSEL=1 YSEL=1 IRA=32 ZERO=1 COEF=0\n001: EWT=1 EWA=0 ZERO=1\n002: TRA=1 XSEL=0 YSEL=1 ZERO=1 COEF=1\n003: XSEL=1 YSEL=1 IRA=33 BSEL=1 COEF=2\n004: TWT=1 TWA=0 EWT=1 EWA=1 ZERO=1\n";
/** Render two independent DSP paths into owned PCM, without an audio device. */
export declare function runRoutingExample(): Promise<{
    sampleRate: number;
    source: string;
    coefficients: number[];
    actual: any;
    reference: {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
    exact: any;
    ramUnchanged: true;
    setup: any;
}>;

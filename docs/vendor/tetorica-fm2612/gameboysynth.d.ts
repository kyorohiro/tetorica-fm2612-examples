/** Borrows the core. Disposing a Synth never destroys this transport's chip. */
export declare class GameboyDirectTransport {
    chip: any;
    constructor(chip: any);
    writeRegister(offset: any, value: any): void;
    reset(): void;
}
export declare class GameboySynth {
    #private;
    pulse: Readonly<{
        setVoice: (ch: any, value: any) => void;
        setDuty: (ch: any, duty: any) => void;
        setEnvelope: (ch: any, value: any) => void;
        setSweep: (value: any) => void;
        setFrequency: (ch: any, hz: any) => number;
        setNote: (ch: any, note: any) => number;
        keyOn: (ch: any) => void;
        keyOff: (ch: any) => void;
    }>;
    wave: Readonly<{
        stopAndSetWaveform: (samples: any) => void;
        setWaveform: (samples: any) => void;
        setLevel: (level: any) => void;
        setFrequency: (hz: any) => number;
        setNote: (note: any) => number;
        keyOn: () => void;
        keyOff: () => void;
    }>;
    noise: Readonly<{
        setVoice: (value: any) => void;
        setEnvelope: (value: any) => void;
        setParameters: (value: any) => void;
        keyOn: () => void;
        keyOff: () => void;
    }>;
    /** @param {{transport: {writeRegister(offset: number, value: number): void, reset(): void}, clock?: number}} [options] */
    constructor({ transport, clock }?: {
        transport: {
            writeRegister(offset: number, value: number): void;
            reset(): void;
        };
        clock?: number;
    });
    writeRegister(offset: any, value: any): void;
    /** Adopt writes made through this Synth without resetting or writing defaults. */
    adoptRegisterState(): void;
    reset(): void;
    initialize(): void;
    setPan(ch: any, left: any, right: any): void;
    setMasterVolume(left: any, right: any): void;
    dispose(): void;
}

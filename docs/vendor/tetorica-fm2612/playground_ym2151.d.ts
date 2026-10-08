/** Independent OPM client. Operator indices follow register order M1, C1, M2, C2. */
export declare function createYm2151Client(port: any): {
    writeRegister: (register: any, value: any) => void;
    reset(): void;
    setOperator(ch: any, operator: any, options: any): void;
    setAlgo(ch: any, algorithm: any, feedback?: number): void;
    setPan(ch: any, left: any, right: any): void;
    /** MIDI integer 13..108 (C#0..C8), at the default 3579545 Hz clock. */
    setNote(ch: any, note: any): number;
    /** Raw key code and 6-bit key fraction; useful for bends and VGM values. */
    setPitch(ch: any, keyCode: any, keyFraction?: number): void;
    keyOn(ch: any, mask?: number): void;
    keyOff(ch: any): void;
    setNoise(enabled: any, frequency?: number): void;
    dispose(): void;
};

export declare const EXTRA_YM2151_CLOCK_HELD_ERROR = "Release the manually held additional YM2151 voices before changing the clock";
/** Independent OPM. Public operators retain the register order M1,C1,M2,C2;
 * the shared voice inspector presents the algorithm order M1,M2,C1,C2. */
export declare function createNativeGenesisYm2151Endpoint(synth: any): {
    client: {
        _getState(): any;
        _adoptState(state: any): void;
        writeRegister: (register: any, value: any) => void;
        reset(): void;
        setOperator(ch: any, operator: any, options: any): void;
        setAlgo(ch: any, algorithm: any, feedback?: number): void;
        setPan(ch: any, left: any, right: any): void;
        setNote(ch: any, note: any): number;
        setFrequency(ch: any, hz: any): {
            keyCode: number;
            keyFraction: number;
        };
        noteOn(ch: any, note: any): void;
        setPitch(ch: any, keyCode: any, keyFraction?: number): void;
        keyOn(ch: any, mask?: number): void;
        keyOff(ch: any): void;
        _forceKeyOff(ch: any): void;
        _stopVoices(): Promise<void>;
        allNotesOff(): void;
        setNoise(enabled: any, frequency?: number): void;
        dispose(): void;
    };
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraYm2151(synth: any, options?: {}): Promise<{
    native: boolean;
    ready: boolean;
    nativeInstance: number;
    kind: any;
    label: any;
    client: any;
    endpoint: any;
    clock: any;
    stereoEnabled: any;
    engine?: any;
    layout: {};
    dispose(): void;
    mix(settings: any): void;
}>;

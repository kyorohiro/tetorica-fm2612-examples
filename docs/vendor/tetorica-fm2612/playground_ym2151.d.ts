/** Independent OPM client. Operator indices follow register order M1, C1, M2, C2. */
/** @param {MessagePort} port */
export declare function createYm2151Client(port: MessagePort): {
    _getState(): any;
    _adoptState(state: any): void;
    writeRegister: (register: any, value: any) => void;
    reset(): void;
    setOperator(ch: any, operator: any, options: any): void;
    setAlgo(ch: any, algorithm: any, feedback?: number): void;
    setPan(ch: any, left: any, right: any): void;
    /** Note name or integer MIDI 0..127; hardware KC/KF range applies. */
    setNote(ch: any, note: any): number;
    setFrequency(ch: any, hz: any): {
        keyCode: number;
        keyFraction: number;
    };
    noteOn(ch: any, note: any): void;
    /** Raw key code and 6-bit key fraction; useful for bends and VGM values. */
    setPitch(ch: any, keyCode: any, keyFraction?: number): void;
    keyOn(ch: any, mask?: number): void;
    keyOff(ch: any): void;
    _forceKeyOff(ch: any): void;
    /** @returns {Promise<void>} */
    _stopVoices(): Promise<void>;
    allNotesOff(): void;
    setNoise(enabled: any, frequency?: number): void;
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

export type GameboyEnvelope = {
    direction?: 'down' | 'up';
    period?: number;
};
export type GameboyPulseVoice = {
    duty?: 0.125 | 0.25 | 0.5 | 0.75;
    volume?: number;
    envelope?: GameboyEnvelope;
};
export type GameboyNoiseVoice = {
    volume?: number;
    envelope?: GameboyEnvelope;
    divisor?: number;
    shift?: number;
    width?: 7 | 15;
};
export type GameboyEnvelopeSettings = GameboyEnvelope & {
    volume?: number;
};
export type GameboySweep = {
    direction?: 'down' | 'up';
    period?: number;
    shift?: number;
};
export type GameboyPulseApi = {
    setVoice(ch: number, voice: GameboyPulseVoice): void;
    setDuty(ch: number, duty: 0.125 | 0.25 | 0.5 | 0.75): void;
    setEnvelope(ch: number, envelope: GameboyEnvelopeSettings): void;
    setSweep(sweep: GameboySweep): void;
    setFrequency(ch: number, hz: number): number;
    setNote(ch: number, note: string | number): number;
    keyOn(ch: number): void;
    keyOff(ch: number): void;
    noteOn(ch: number, note: string | number): void;
};
export type GameboyWaveApi = {
    stopAndSetWaveform(samples: number[] | Uint8Array): void;
    setWaveform(samples: number[] | Uint8Array): void;
    setLevel(level: 0 | 1 | 0.5 | 0.25): void;
    setFrequency(hz: number): number;
    setNote(note: string | number): number;
    keyOn(): void;
    keyOff(): void;
    noteOn(note: string | number): void;
};
export type GameboyNoiseApi = {
    setVoice(voice: GameboyNoiseVoice): void;
    setEnvelope(envelope: GameboyEnvelopeSettings): void;
    setParameters(parameters: Pick<GameboyNoiseVoice, 'divisor' | 'shift' | 'width'>): void;
    keyOn(): void;
    keyOff(): void;
};
/** Borrows the core. Disposing a Synth never destroys this transport's chip. */
export declare class GameboyDirectTransport {
    chip: import("./gameboyapu.js").GameboyApu;
    /** @param {import('./gameboyapu.js').GameboyApu} chip */
    constructor(chip: import('./gameboyapu.js').GameboyApu);
    /** @param {number} offset
     * @param {number} value */
    writeRegister(offset: number, value: number): void;
    reset(): void;
}
export declare class GameboySynth {
    #private;
    clock: number;
    /** @type {Readonly<GameboyPulseApi>} */
    pulse: Readonly<GameboyPulseApi>;
    /** @type {Readonly<GameboyWaveApi>} */
    wave: Readonly<GameboyWaveApi>;
    /** @type {Readonly<GameboyNoiseApi>} */
    noise: Readonly<GameboyNoiseApi>;
    /** @param {{transport: {writeRegister(offset: number, value: number): void, reset(): void}, clock?: number}} [options] */
    constructor({ transport, clock }?: {
        transport: {
            writeRegister(offset: number, value: number): void;
            reset(): void;
        };
        clock?: number;
    });
    /** @param {number} offset
     * @param {number} value */
    writeRegister(offset: number, value: number): void;
    /** Adopt writes made through this Synth without resetting or writing defaults. */
    adoptRegisterState(): void;
    /** Internal snapshot for switching execution threads without replaying triggers. */
    _getState(): {
        clock: number;
        initialized: boolean;
        registers: number[];
        voice: number[];
    };
    _adoptState(state: any): void;
    reset(): void;
    initialize(): void;
    /** Tone channel 0/1=pulse, 2=wave. Configure Hz without triggering.
     * @param {number} ch @param {number} hz */
    setFrequency(ch: number, hz: number): number;
    /** @param {number} ch @param {string|number} note */
    setNote(ch: number, note: string | number): number;
    /** Channel 0/1=pulse, 2=wave, 3=noise. @param {number} ch */
    keyOn(ch: number): void;
    /** @param {number} ch */
    keyOff(ch: number): void;
    /** Set a note name or integer MIDI note and trigger. @param {number} ch @param {string|number} note */
    noteOn(ch: number, note: string | number): void;
    /** @param {number} ch
     * @param {boolean} left
     * @param {boolean} right */
    setPan(ch: number, left: boolean, right: boolean): void;
    /** @param {number} left
     * @param {number} right */
    setMasterVolume(left: number, right: number): void;
    dispose(): void;
}

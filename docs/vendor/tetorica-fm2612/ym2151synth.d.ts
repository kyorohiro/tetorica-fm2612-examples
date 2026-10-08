export { YM2151_CLOCK } from './ym2151.js';
export { YM2151WorkletTransport } from './chip_worklet_transport.js';
export type YM2151OperatorParams = {
    dt?: number;
    dt1?: number;
    multi?: number;
    mul?: number;
    tl?: number;
    rs?: number;
    ks?: number;
    ar?: number;
    am?: boolean | number;
    d1r?: number;
    dt2?: number;
    d2r?: number;
    sr?: number;
    sl?: number;
    d1l?: number;
    rr?: number;
};
export type YM2151Preset = {
    label?: string;
    algorithm?: number;
    feedback?: number;
    ams?: number;
    pms?: number;
    pan?: {
        left?: boolean;
        right?: boolean;
    };
    operators?: YM2151OperatorParams[];
};
export type YM2151Transport = {
    writeRegister(register: number, value: number): void;
    reset?: () => void;
};
/** Borrows the caller's chip; does not create or close an audio device. */
export declare class YM2151DirectTransport {
    chip: import("./ym2151.js").Ym2151;
    /** @param {import('./ym2151.js').Ym2151} chip */
    constructor(chip: import('./ym2151.js').Ym2151);
    /** @param {number} offset @param {number} value */
    write(offset: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    reset(): void;
    sampleRate(): number;
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    readStatus(): number;
    getIrq(): boolean;
}
/** Eight-channel OPM Synth, shared by Direct, Worklet and Node transports.
 * Operators and key masks use logical M1, M2, C1, C2 order (0..3).
 * Notes use the default YM2151_CLOCK; setPitch() exposes raw KC/KF values.
 */
export declare class YM2151Synth {
    #private;
    transport: YM2151Transport;
    /** @param {{transport: YM2151Transport}} options */
    constructor({ transport }?: {
        transport: YM2151Transport;
    });
    reset(): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** Partial updates preserve other fields, including values written with writeRegister().
     * @param {number} ch @param {number} operator @param {YM2151OperatorParams} params */
    setOperator(ch: number, operator: number, params: YM2151OperatorParams): void;
    /** Validates the entire preset before issuing any writes. FM_PRESETS use compatible fields.
     * OPN-only SSG envelopes are unsupported; OPM adds dt2 (0..3).
     * @param {number} ch @param {YM2151Preset} preset */
    setPreset(ch: number, preset: YM2151Preset): void;
    /** @param {number} ch @param {number} algorithm @param {number} [feedback] */
    setAlgo(ch: number, algorithm: number, feedback?: number): void;
    /** @param {number} ch @param {boolean} left @param {boolean} right @param {number} [ams] @param {number} [pms] */
    setPan(ch: number, left: boolean, right: boolean, ams?: number, pms?: number): void;
    /** @param {number} ch @param {string | number} note Note name or MIDI integer 13..108.
     * @returns {number} Written raw key code. */
    setNote(ch: number, note: string | number): number;
    /** Frequency in Hz at the default 3579545 Hz clock; quantized to 1/64 semitone.
     * @param {number} ch @param {number} frequency */
    setFrequency(ch: number, frequency: number): {
        keyCode: number;
        keyFraction: number;
    };
    /** Raw key code 0..127 and key fraction 0..63.
     * @param {number} ch @param {number} code @param {number} [fraction] */
    setPitch(ch: number, code: number, fraction?: number): void;
    /** @param {number} ch @param {number} [mask] Logical operator bits 0..3. */
    keyOn(ch: number, mask?: number): void;
    /** @param {number} ch */
    keyOff(ch: number): void;
    /** @param {number} ch @param {string | number} note @param {{operatorMask?: number}} [options] */
    noteOn(ch: number, note: string | number, { operatorMask }?: {
        operatorMask?: number;
    }): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    /** @param {{frequency?: number, amDepth?: number, pmDepth?: number, waveform?: number}} [options] */
    setLFO(options?: {
        frequency?: number;
        amDepth?: number;
        pmDepth?: number;
        waveform?: number;
    }): void;
    /** Noise replaces the last operator on channel 7.
     * @param {boolean} enabled @param {number} [frequency] */
    setNoise(enabled: boolean, frequency?: number): void;
}

/** Three tone/noise channels sharing one noise generator and one envelope. */
export declare class SSGSynth {
    transport: {
        write: (register: number, value: number) => void;
    };
    clock: number;
    registers: Uint8Array<ArrayBuffer> | undefined;
    /** @param {{transport: {write: (register: number, value: number) => void}, clock: number}} options
     * clock is the effective SSG clock, not necessarily the package's master clock.
     */
    constructor({ transport, clock }: {
        transport: {
            write: (register: number, value: number) => void;
        };
        clock: number;
    });
    /** Reset tracked registers after the parent chip was reset. Does not write hardware. */
    resetState(): void;
    /** Track parent Synth raw writes so mixer changes preserve other channels and I/O bits. */
    observeWrite(register: any, value: any): void;
    write(register: any, value: any): void;
    /** Silence/reset SSG audio registers only; FM and I/O registers are preserved. */
    reset(): void;
    /** @param {number} channel 0..2.
     * @param {{period?: number, frequency?: number, volume?: number, envelope?: boolean}} options
     * volume is hardware level 0..15 (0=silent). period overrides frequency.
     */
    tone(channel: number, { period, frequency, volume, envelope }?: {
        period?: number;
        frequency?: number;
        volume?: number;
        envelope?: boolean;
    }): number;
    /** Enable shared noise on one channel. Changing period affects all noise-enabled channels. */
    noise(channel: any, { period, volume, envelope }?: {
        envelope?: boolean | undefined;
        period?: number | undefined;
        volume?: number | undefined;
    }): void;
    /** Change only tone pitch, preserving mixer/volume. Raw 12-bit hardware period. */
    setTonePeriod(channel: any, period: any): void;
    /** Mixer gates may combine tone and noise on the same channel. */
    setMixer(channel: any, { tone, noise }: {
        noise: any;
        tone: any;
    }): void;
    /** Envelope selection replaces fixed volume with the shared hardware envelope. */
    setVolume(channel: any, volume: any, envelope?: boolean): void;
    off(channel: any): void;
    /** Set the shared envelope period/shape; writing shape retriggers the envelope. */
    setEnvelope({ period, shape }: {
        period: any;
        shape: any;
    }): void;
}

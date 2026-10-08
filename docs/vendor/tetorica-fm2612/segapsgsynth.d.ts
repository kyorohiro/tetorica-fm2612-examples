/** Direct register transport. The caller retains ownership of the chip. */
export declare class SegaPSGDirectTransport {
    chip: import("./segapsg.js").SegaPSG;
    /** @param {import('./segapsg.js').SegaPSG} chip */
    constructor(chip: import('./segapsg.js').SegaPSG);
    write(value: any): void;
    reset(): void;
}
/** Tone/noise register generation shared by Node.js and browser transports. */
export declare class SegaPSGSynth {
    transport: {
        (number: any): void;
        (): void;
        (): void;
        write: Function;
        reset?: Function | undefined;
        resetAll?: Function | undefined;
    };
    /** @param {{transport: {write: function(number): void, reset?: function(): void, resetAll?: function(): void}}} options */
    constructor({ transport }?: {
        transport: {
            write: Function;
            (number: any): void;
            reset?: Function;
            (): void;
            resetAll?: Function;
            (): void;
        };
    });
    /** Write a raw PSG command byte. */
    write(value: any): any;
    reset(): any;
    resetAll(): any;
    /** @param {number} channel Physical tone channel, 0..2.
     * @param {{note?: string, frequency?: number, period?: number, attenuation?: number, volume?: number}} [options]
     * @returns {number} Written 10-bit period, calculated using SEGAPSG_CLOCK.
     */
    tone(channel: number, options?: {
        note?: string;
        frequency?: number;
        period?: number;
        attenuation?: number;
        volume?: number;
    }): number;
    /** Set the exact 10-bit tone period without changing attenuation. Zero retains chip-specific behavior. */
    setPeriod(channel: any, period: any): any;
    /** Set attenuation only: 0 is loudest, 15 is silent; channel 3 is noise. */
    setAttenuation(channel: any, attenuation: any): void;
    /** Write noise control only. Resets the noise shift register, without changing attenuation. */
    setNoise({ type, rate }?: {
        rate?: string | undefined;
        type?: string | undefined;
    }): number;
    off(channel: any): void;
    /** @param {{type?: "white"|"periodic", rate?: "low"|"medium"|"high"|"tone3", attenuation?: number, volume?: number}} [options]
     * @returns {number} Noise mode bits.
     */
    noise(options?: {
        type?: "white" | "periodic";
        rate?: "low" | "medium" | "high" | "tone3";
        attenuation?: number;
        volume?: number;
    }): number;
    noiseVolume(volume: any): void;
    noiseOff(): void;
}
export declare function psgPeriodFromFrequency(frequency: any): number;
export declare function psgPeriodFromNote(note: any): number;

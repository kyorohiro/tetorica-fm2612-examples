/** Direct register transport. The caller retains ownership of the chip. */
export declare class SegaPSGDirectTransport {
    chip: import("./segapsg.js").SegaPSG;
    /** @param {import('./segapsg.js').SegaPSG} chip */
    constructor(chip: import('./segapsg.js').SegaPSG);
    /** @param {number} value */
    write(value: number): void;
    reset(): void;
    setStereo(mask: any): void;
}
/** Tone/noise register generation shared by Node.js and browser transports. */
export declare class SegaPSGSynth {
    #private;
    transport: {
        clock?: number;
        write: (value: number) => void;
        setStereo?: (mask: number) => void;
        reset?: () => void;
        resetAll?: () => void;
    };
    /** @param {{transport: {clock?:number, write: (value: number) => void, setStereo?:(mask:number)=>void, reset?: () => void, resetAll?: () => void}}} [options] Ordered register transport. */
    constructor({ transport }?: {
        transport: {
            clock?: number;
            write: (value: number) => void;
            setStereo?: (mask: number) => void;
            reset?: () => void;
            resetAll?: () => void;
        };
    });
    /** Write a raw PSG command byte. @param {number} value */
    write(value: number): void;
    reset(): void | undefined;
    resetAll(): void | undefined;
    /** Game Gear routing: bits 0..3 right, bits 4..7 left. */
    setStereo(mask: any): void;
    /** Silence all four voices while keeping configured attenuation and routing. */
    allNotesOff(): void;
    _forceKeyOff(channel: any): void;
    _getState(): {
        attenuations: number[];
        latched: number;
        stereo: number;
    };
    _adoptState(state?: {}): void;
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
    /** Set the exact 10-bit tone period without changing attenuation. Zero retains chip-specific behavior. @param {number} channel @param {number} period */
    setPeriod(channel: number, period: number): number;
    /** Configure Hz, preserving attenuation. @param {number} channel @param {number} hz */
    setFrequency(channel: number, hz: number): number;
    /** @param {number} channel @param {string|number} note */
    setNote(channel: number, note: string | number): number;
    /** Restore the configured attenuation without changing pitch. @param {number} channel */
    keyOn(channel: number): void;
    /** Silence while remembering the configured attenuation. @param {number} channel */
    keyOff(channel: number): void;
    /** @param {number} channel @param {string|number} note */
    noteOn(channel: number, note: string | number): void;
    /** Set attenuation only: 0 is loudest, 15 is silent; channel 3 is noise. @param {number} channel @param {number} attenuation */
    setAttenuation(channel: number, attenuation: number): void;
    /** Write noise control only. Resets the noise shift register, without changing attenuation. */
    setNoise({ type, rate }?: {
        rate?: string | undefined;
        type?: string | undefined;
    }): number;
    /** @param {number} channel */
    off(channel: number): void;
    /** @param {{type?: "white"|"periodic", rate?: "low"|"medium"|"high"|"tone3", attenuation?: number, volume?: number}} [options]
     * @returns {number} Noise mode bits.
     */
    noise(options?: {
        type?: "white" | "periodic";
        rate?: "low" | "medium" | "high" | "tone3";
        attenuation?: number;
        volume?: number;
    }): number;
    /** @param {number} volume */
    noiseVolume(volume: number): void;
    noiseOff(): void;
}
/** @param {number} frequency */
export declare function psgPeriodFromFrequency(frequency: number, clock?: number): number;
/** @param {string | number} note */
export declare function psgPeriodFromNote(note: string | number, clock?: number): number;

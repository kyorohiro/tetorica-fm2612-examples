export { AY8910_CLOCK } from './ay8910.js';
export { AY8910WorkletTransport } from './chip_worklet_transport.js';
export type AY8910Voice = {
    tone?: boolean;
    noise?: boolean;
    volume?: number;
    envelope?: boolean;
    period?: number;
    frequency?: number;
    note?: string | number;
};
export type AY8910Tone = {
    period?: number;
    frequency?: number;
    note?: string | number;
    volume?: number;
    envelope?: boolean;
};
export type AY8910Transport = {
    writeRegister(register: number, value: number): void;
    reset?: () => void;
    dispose?: () => void;
};
export type AY8910State = {
    registers: number[] | Uint8Array;
    levels?: number[] | Uint8Array;
};
export type RegisterChange = [number, number, number];
/** AY tone frequency = clock / (16 * period). Raw zero periods behave as one.
 * @param {number} frequency @param {number} [clock] @returns {number} */
export declare function ay8910PeriodFromHz(frequency: number, clock?: number): number;
/** Borrow a synchronous AY chip. Its clock was fixed by Ay8910.create(); the
 * Synth's clock must match it. This adapter never owns or disposes the chip.
 * Native normalized DAC output retains a constant DC baseline at volume zero;
 * speaker transports additionally mute silent channels for exact zero PCM. */
export declare class AY8910DirectTransport {
    chip: import("./ay8910.js").Ay8910;
    /** @param {import('./ay8910.js').Ay8910} chip */
    constructor(chip: import('./ay8910.js').Ay8910);
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    reset(): void;
    sampleRate(): number;
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
}
/** Three AY-3-8910 physical voices. Each mixes tone and the one shared noise
 * source, then uses fixed volume or the one shared envelope. Volume 0 is silent;
 * 15 is loudest. Construction never resets or writes a borrowed transport.
 *
 * keyOff() silences a voice while retaining its configured level. keyOn()
 * restores that level and preserves tone/noise gates, including noise-only
 * voices. Shared noise/envelope edits affect all voices using those sources.
 */
export declare class AY8910Synth {
    #private;
    transport: AY8910Transport;
    clock: any;
    chip: string;
    channels: number;
    /** @type {((register:number,value:number)=>boolean|void)|undefined} */ _beforeWrite: ((register: number, value: number) => boolean | void) | undefined;
    /** @type {((event:{method:string,args:number[],channel?:number})=>void)|undefined} */ _observe: ((event: {
        method: string;
        args: number[];
        channel?: number;
    }) => void) | undefined;
    /** @param {{transport:AY8910Transport,clock?:number}} settings */
    constructor({ transport, clock }?: {
        transport: AY8910Transport;
        clock?: number;
    });
    reset(): void;
    /** Reset to silent A4 tone-only voices. Actual volume registers are zero;
     * keyOn restores configured volume 9. I/O ports are untouched after reset. */
    initialize(): void;
    getRegisterSnapshot(): Uint8Array<ArrayBuffer>;
    /** Adopt raw registers without writes. Zero output levels lack keyOff's
     * retained-voice metadata, so they default to level 9 for a new audition.
     * Use _adoptState() to preserve an intentionally configured zero level.
     * @param {Uint8Array|number[]} snapshot */
    adoptRegisterSnapshot(snapshot: Uint8Array | number[]): void;
    /** Full musical state includes the levels retained by keyOff(). */
    _getState(): {
        registers: number[];
        levels: number[];
    };
    /** No writes; validates the complete state before adoption.
     * @param {AY8910State} state */
    _adoptState(state: AY8910State): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** Atomic partial voice edit. Pitch, mixer and loudness are independent.
     * @param {number} ch @param {AY8910Voice} voice */
    setVoice(ch: number, voice: AY8910Voice): void;
    /** Start a tone-only voice, preserving unspecified volume/envelope settings.
     * @param {number} ch @param {AY8910Tone} [settings] @returns {number} Tone period. */
    tone(ch: number, settings?: AY8910Tone): number;
    /** @param {number} ch @param {AY8910Tone} [settings] */
    setTone(ch: number, settings?: AY8910Tone): number;
    /** Start a noise-only voice. The period belongs to the shared noise source.
     * @param {number} ch @param {{period?:number,volume?:number,envelope?:boolean}} [settings] */
    noise(ch: number, settings?: {
        period?: number;
        volume?: number;
        envelope?: boolean;
    }): void;
    /** Gates are independent; both tone and noise may be enabled on one voice.
     * @param {number} ch @param {{tone?:boolean,noise?:boolean}} gates */
    setMixer(ch: number, gates: {
        tone?: boolean;
        noise?: boolean;
    }): void;
    /** Fixed loudness, 0=silent and 15=loudest; optional envelope selection.
     * Omitted envelope preserves the configured selection even after keyOff().
     * @param {number} ch @param {number} volume @param {boolean} [envelope] */
    setVolume(ch: number, volume: number, envelope?: boolean): void;
    /** @param {number} ch @param {number} period */
    setTonePeriod(ch: number, period: number): void;
    /** @param {number} ch @param {number} frequency */
    setFrequency(ch: number, frequency: number): number;
    /** @param {number} ch @param {string|number} note */
    setNote(ch: number, note: string | number): number;
    /** @param {number} period Shared five-bit noise period. */
    setNoisePeriod(period: number): void;
    /** Shared envelope. Writing shape retriggers it; a period-only edit does not.
     * @param {{period?:number,shape?:number}} envelope */
    setEnvelope(envelope: {
        period?: number;
        shape?: number;
    }): void;
    /** Restore configured level and retain the current tone/noise combination.
     * @param {number} ch */
    keyOn(ch: number): void;
    /** Silence while retaining configured volume/envelope, pitch and mixer.
     * @param {number} ch */
    keyOff(ch: number): void;
    /** MIDI changes tone pitch; noise-only voices retain their noise sound.
     * @param {number} ch @param {string|number} note */
    noteOn(ch: number, note: string | number): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    /** @param {number} ch */
    off(ch: number): void;
    allNotesOff(): void;
}

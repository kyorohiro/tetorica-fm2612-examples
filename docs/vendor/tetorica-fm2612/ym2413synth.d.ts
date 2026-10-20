export { YM2413_CLOCK } from './ym2413.js';
export { YM2413WorkletTransport } from './chip_worklet_transport.js';
export type YM2413UserOperatorParams = {
    am?: boolean | number;
    vibrato?: boolean | number;
    egt?: boolean | number;
    sustain?: boolean | number;
    ksr?: boolean | number;
    multi?: number;
    mul?: number;
    ksl?: number;
    tl?: number;
    ar?: number;
    dr?: number;
    sl?: number;
    rr?: number;
    waveform?: number;
};
export type YM2413UserPatch = {
    label?: string;
    feedback?: number;
    operators?: YM2413UserOperatorParams[];
};
export type YM2413Voice = {
    instrument?: number;
    attenuation?: number;
    sustain?: boolean;
};
export type YM2413Preset = YM2413Voice & {
    userPatch?: YM2413UserPatch | Uint8Array | number[];
};
export type YM2413Drum = 'bassDrum' | 'snare' | 'tom' | 'cymbal' | 'hiHat';
export type YM2413RhythmLevels = {
    bassDrum?: number;
    snare?: number;
    tom?: number;
    cymbal?: number;
    hiHat?: number;
};
export type YM2413Rhythm = {
    enabled?: boolean;
    bassDrum?: boolean;
    snare?: boolean;
    tom?: boolean;
    cymbal?: boolean;
    hiHat?: boolean;
};
export type YM2413Transport = {
    writeRegister(register: number, value: number): void;
    reset?: () => void;
    dispose?: () => void;
};
export type RegisterChange = [number, number, number];
/** OPLL's F-NUM is nine bits, unlike OPL's ten bits. At multiplier one,
 * frequency = (clock / 72) * F-NUM * 2^(BLOCK - 19).
 * @param {number} frequency Frequency in Hz. @param {number} [clock]
 * @returns {{fnum:number,block:number}} */
export declare function ym2413PitchFromHz(frequency: number, clock?: number): {
    fnum: number;
    block: number;
};
/** Borrow a synchronous YM2413 chip without creating or owning an audio device. */
export declare class YM2413DirectTransport {
    chip: import("./ym2413.js").Ym2413;
    clock: any;
    /** @param {import('./ym2413.js').Ym2413} chip @param {{clock?:number}} [options] */
    constructor(chip: import('./ym2413.js').Ym2413, { clock }?: {
        clock?: number;
    });
    /** @param {number} offset @param {number} value */
    write(offset: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    reset(): void;
    sampleRate(): number;
    /** Both melody and percussion buses are mono and summed to left and right.
     * @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    readStatus(): number;
    getIrq(): boolean;
}
/** YM2413 OPLL: nine two-operator melody voices, or six melody voices and five
 * percussion instruments. Physical channels are zero-based. Instruments 1..15
 * use the chip's built-in voices; all instrument-0 channels share one user
 * patch in registers 0..7. Editing it changes every instrument-0 voice.
 *
 * Construction makes no writes. initialize() explicitly resets and installs
 * a useful shared user patch while leaving every channel silent. Attach to
 * existing playback with adoptRegisterSnapshot(), which makes no writes.
 */
export declare class YM2413Synth {
    #private;
    transport: YM2413Transport;
    clock: any;
    chip: string;
    channels: number;
    /** @type {((register:number,value:number)=>boolean|void)|undefined} */
    _beforeWrite: ((register: number, value: number) => boolean | void) | undefined;
    /** @type {((event:{method:string,args:number[],channel?:number})=>void)|undefined} */
    _observe: ((event: {
        method: string;
        args: number[];
        channel?: number;
    }) => void) | undefined;
    /** @param {{transport:YM2413Transport,clock?:number}} options */
    constructor({ transport, clock }?: {
        transport: YM2413Transport;
        clock?: number;
    });
    reset(): void;
    /** Reset, load the original sine user patch, and select silent Violin voices. */
    initialize(): void;
    getRegisterSnapshot(): Uint8Array<ArrayBuffer>;
    /** Replace the authoring shadow without replaying or resetting hardware.
     * @param {Uint8Array|number[]} snapshot */
    adoptRegisterSnapshot(snapshot: Uint8Array | number[]): void;
    /** @param {number} register Address 0..63. @param {number} value Byte 0..255. */
    writeRegister(register: number, value: number): void;
    /** Per-channel instrument and output attenuation. 0=loud, 15=quiet.
     * This does not allocate a separate instrument-0 patch for the channel.
     * @param {number} ch @param {YM2413Voice} voice */
    setVoice(ch: number, voice: YM2413Voice): void;
    /** @param {number} ch @param {number} instrument @param {number} [attenuation] */
    setInstrument(ch: number, instrument: number, attenuation?: number): void;
    /** @param {number} ch @param {number} attenuation 0=loud, 15=quiet. */
    setAttenuation(ch: number, attenuation: number): void;
    /** Channel sustain flag; separate from the shared operators' EGT bits.
     * @param {number} ch @param {boolean} enabled */
    setSustain(ch: number, enabled: boolean): void;
    /** Select a built-in instrument, or apply a shared user patch and select 0.
     * A userPatch changes all existing instrument-0 voices, not just this channel.
     * The complete preset is validated before any writes.
     * @param {number} ch @param {number|YM2413Preset} preset */
    setPreset(ch: number, preset: number | YM2413Preset): void;
    /** Edit one of the two shared user-patch operators, preserving adjacent bits.
     * Operator 0 is the modulator, 1 the carrier. There is no per-channel user
     * patch. Carrier loudness is setAttenuation(channel, level), not operator TL.
     * @param {number} op @param {YM2413UserOperatorParams} params */
    setUserOperator(op: number, params: YM2413UserOperatorParams): void;
    /** Partial structured edits, or a complete eight-byte hardware patch.
     * Changes immediately affect every channel selecting instrument 0.
     * @param {YM2413UserPatch|Uint8Array|number[]} patch */
    setUserPatch(patch: YM2413UserPatch | Uint8Array | number[]): void;
    /** Raw nine-bit F-NUM and three-bit BLOCK; preserves key/sustain/reserved bits.
     * In rhythm mode this also tunes the physical percussion voices on CH6..8.
     * @param {number} ch @param {number} fnum @param {number} [block] */
    setPitch(ch: number, fnum: number, block?: number): void;
    /** @param {number} ch @param {number} frequency Hz at this synth's master clock. */
    setFrequency(ch: number, frequency: number): {
        fnum: number;
        block: number;
    };
    /** @param {number} ch @param {string|number} note A4 = MIDI 69 = 440 Hz. */
    setNote(ch: number, note: string | number): {
        fnum: number;
        block: number;
    };
    /** @param {number} ch */
    keyOn(ch: number): void;
    /** Release the normal melodic key source, preserving pitch and sustain.
     * @param {number} ch */
    keyOff(ch: number): void;
    /** Set pitch and assert a melodic key. For a new attack, release first and
     * allow PCM time between the release and next key-on.
     * @param {number} ch @param {string|number} note */
    noteOn(ch: number, note: string | number): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    allNotesOff(): void;
    /** Enable percussion and/or partially edit its five trigger bits. Changing
     * mode releases the normal CH6..8 keys. Registers 0x36..0x38 stay shared:
     * disabling rhythm does not restore previous melodic instrument selections.
     * @param {YM2413Rhythm} settings */
    setRhythm(settings: YM2413Rhythm): void;
    /** Per-drum attenuation, 0=loud, 15=quiet. BD uses 0x36 low nibble;
     * HH/SD use 0x37 high/low, TOM/CYM use 0x38 high/low. While rhythm is off,
     * the HH and TOM nibbles are CH7/8's melodic instrument numbers: no separate
     * virtual copy is kept. These writes are permitted before enabling rhythm.
     * @param {YM2413RhythmLevels} levels */
    setRhythmLevels(levels: YM2413RhythmLevels): void;
    /** @param {YM2413Drum} drum @param {number} attenuation */
    setRhythmLevel(drum: YM2413Drum, attenuation: number): void;
}
/** Built-in instrument names, indexed by hardware instrument number 0..15.
 * These are labels, not copied ROM patch bytes. Instrument 0 is caller-defined.
 * @type {readonly string[]} */
export declare const YM2413_INSTRUMENTS: readonly string[];
/** Original shared user patches, constructed from hardware parameters.
 * Carrier attenuation belongs to each voice and is not part of these patches.
 * @type {Readonly<Record<string,YM2413UserPatch>>} */
export declare const YM2413_USER_PRESETS: Readonly<Record<string, YM2413UserPatch>>;

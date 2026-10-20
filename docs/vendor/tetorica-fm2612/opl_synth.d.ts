export type OPLChip = 'ym3526' | 'ym3812' | 'y8950' | 'ymf262';
export type OPLChipName = OPLChip;
export type OPLOperatorParams = {
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
export type OPLPreset = {
    label?: string;
    name?: string;
    algorithm?: number;
    feedback?: number;
    fourOp?: boolean;
    pan?: {
        left?: boolean;
        right?: boolean;
    };
    operators?: OPLOperatorParams[];
};
export type OPLTransport = {
    writeRegister(register: number, value: number, port?: number): void;
    reset?: () => void;
    dispose?: () => void;
};
export type RegisterChange = [number, number, number];
/** Convert Hz to the closest representable OPL BLOCK/F-NUM pair.
 * OPL/OPL2 generate at clock/72; OPL3 uses clock/288. A multiplier of one
 * advances the 20-bit phase by F-NUM * 2^BLOCK each native PCM sample.
 * @param {number} frequency @param {number} [clock] @param {OPLChip} [chip]
 * @returns {{fnum:number,block:number}} */
export declare function oplPitchFromHz(frequency: number, clock?: number, chip?: OPLChip): {
    fnum: number;
    block: number;
};
/** Borrow a synchronous chip. The transport does not own or dispose the chip. */
export declare class OPLDirectTransport {
    chip: {
        write(offset: number, value: number): void;
        reset(): void;
        sampleRate?: (clock?: number) => number;
        generateStereo?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        readStatus?: () => number;
        getIrq?: () => boolean;
    };
    kind: OPLChip;
    clock: any;
    /** @param {{write(offset:number,value:number):void,reset():void,sampleRate?:(clock?:number)=>number,
     * generateStereo?:(frames:number)=>{left:Float32Array,right:Float32Array},readStatus?:()=>number,getIrq?:()=>boolean}} chip
     * @param {{chip?:OPLChip,clock?:number}} [options] */
    constructor(chip: {
        write(offset: number, value: number): void;
        reset(): void;
        sampleRate?: (clock?: number) => number;
        generateStereo?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        readStatus?: () => number;
        getIrq?: () => boolean;
    }, { chip: kind, clock }?: {
        chip?: OPLChip;
        clock?: number;
    });
    /** @param {number} offset @param {number} value */
    write(offset: number, value: number): void;
    /** Byte register plus port, or a flattened OPL3 register address (0..511).
     * @param {number} register @param {number} value @param {number} [port] */
    writeRegister(register: number, value: number, port?: number): void;
    reset(): void;
    sampleRate(): number | undefined;
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    readStatus(): number | undefined;
    getIrq(): boolean;
}
/** Nine-channel OPL/OPL2 or eighteen-channel OPL3 instrument authoring.
 * Channels are physical, zero-based. Logical operator order is modulator,
 * carrier (0,1); a four-operator voice appends the paired channel's operators
 * (2,3). OPL3 four-operator primaries are 0..2 and 9..11; each borrows CH+3.
 *
 * Construction never resets a borrowed chip. Call initialize() for silent,
 * centered defaults, or adoptRegisterSnapshot() when attaching to live state.
 * Raw writes made through this instance remain authoritative for partial edits.
 */
export declare class OPLSynth {
    #private;
    transport: OPLTransport;
    chip: OPLChip;
    clock: any;
    channels: any;
    /** @type {((register:number,value:number,port:number)=>boolean|void)|undefined} */
    _beforeWrite: ((register: number, value: number, port: number) => boolean | void) | undefined;
    /** @type {((event:{method:string,args:number[],channel?:number})=>void)|undefined} */
    _observe: ((event: {
        method: string;
        args: number[];
        channel?: number;
    }) => void) | undefined;
    /** @param {{transport:OPLTransport,chip?:OPLChip,clock?:number}} options */
    constructor({ transport, chip, clock }?: {
        transport: OPLTransport;
        chip?: OPLChip;
        clock?: number;
    });
    /** Reset chip/core state without applying an instrument. */
    reset(): void;
    /** Reset and install silent two-operator voices; enable OPL2/OPL3 waveforms. */
    initialize(): void;
    /** Copy of hardware register authoring state, indexed by (port << 8)|register. */
    getRegisterSnapshot(): Uint8Array<ArrayBuffer>;
    /** Adopt an entire register image without writing or resetting the hardware.
     * @param {Uint8Array|number[]} snapshot */
    adoptRegisterSnapshot(snapshot: Uint8Array | number[]): void;
    /** Raw byte register plus port, or flattened OPL3 register (0..511).
     * @param {number} register @param {number} value @param {number} [port] */
    writeRegister(register: number, value: number, port?: number): void;
    /** Whether this channel is an enabled four-operator primary. @param {number} ch */
    isFourOp(ch: number): boolean;
    /** Enable/disable one YMF262 four-operator pair, stopping both keys first.
     * @param {number} ch Primary channel (0..2 or 9..11). @param {boolean} enabled */
    setFourOp(ch: number, enabled: boolean): void;
    /** Partial operator updates preserve adjacent bits, including prior raw writes.
     * KSL is the raw two-bit hardware code, not a sorted attenuation scale.
     * @param {number} ch @param {number} op @param {OPLOperatorParams} params */
    setOperator(ch: number, op: number, params: OPLOperatorParams): void;
    /** Validate the complete patch before issuing any hardware writes.
     * Algorithms: two-op 0=FM, 1=additive. Four-op: 0=1→2→3→4,
     * 1=1+(2→3→4), 2=(1→2)+(3→4), 3=1+(2→3)+4.
     * @param {number} ch @param {OPLPreset} preset */
    setPreset(ch: number, preset: OPLPreset): void;
    /** @param {number} ch @param {number} algorithm @param {number} [feedback] */
    setAlgo(ch: number, algorithm: number, feedback?: number): void;
    /** OPL3 stereo routing; preserves the additional hardware C/D output bits.
     * @param {number} ch @param {boolean} left @param {boolean} right */
    setPan(ch: number, left: boolean, right: boolean): void;
    /** Raw F-NUM (0..1023) and BLOCK (0..7); preserves key-on and reserved bits.
     * @param {number} ch @param {number} fnum @param {number} [block] */
    setPitch(ch: number, fnum: number, block?: number): void;
    /** @param {number} ch @param {number} frequency Frequency in Hz. */
    setFrequency(ch: number, frequency: number): {
        fnum: number;
        block: number;
    };
    /** Note name or MIDI integer; A4 = MIDI 69 = 440 Hz.
     * @param {number} ch @param {string|number} note */
    setNote(ch: number, note: string | number): {
        fnum: number;
        block: number;
    };
    /** Key a melodic voice; rhythm mode reserves physical channels 6..8.
     * @param {number} ch */
    keyOn(ch: number): void;
    /** @param {number} ch */
    keyOff(ch: number): void;
    /** @param {number} ch @param {string|number} note */
    noteOn(ch: number, note: string | number): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    /** Release every physical key and all percussion triggers, preserving patches. */
    allNotesOff(): void;
    /** Enable the hardware rhythm section and/or partially edit trigger bits.
     * High-level melodic key-on is unavailable on CH6..8 while enabled.
     * @param {{enabled?:boolean,bassDrum?:boolean,snare?:boolean,tom?:boolean,cymbal?:boolean,hiHat?:boolean}} settings */
    setRhythm(settings: {
        enabled?: boolean;
        bassDrum?: boolean;
        snare?: boolean;
        tom?: boolean;
        cymbal?: boolean;
        hiHat?: boolean;
    }): void;
    /** Fixed-rate hardware LFO depth flags (false=shallow, true=deep).
     * Enable AM/vibrato individually on operators to hear the LFO.
     * @param {{amDepth?:boolean,pmDepth?:boolean}} settings */
    setLFO(settings: {
        amDepth?: boolean;
        pmDepth?: boolean;
    }): void;
}
/** Original two-operator patches shared by the OPL family, plus an OPL3 patch.
 * The sine patch silences its modulator; every patch explicitly selects mode.
 * @type {Readonly<Record<string,OPLPreset>>} */
export declare const OPL_PRESETS: Readonly<Record<string, OPLPreset>>;

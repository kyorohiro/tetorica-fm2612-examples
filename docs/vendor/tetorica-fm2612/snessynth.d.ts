export declare const SNES_CHANNEL_COUNT = 8;
export declare const SNES_SAMPLE_RATE = 32000;
export type SnesBRROptions = ({
    rootNote: string | number;
    baseFrequencyHz?: never;
} | {
    baseFrequencyHz: number;
    rootNote?: never;
}) & {
    basePitch?: number;
    loopStartSamples?: number;
};
/** @typedef {({rootNote:string|number,baseFrequencyHz?:never}|{baseFrequencyHz:number,rootNote?:never}) & {basePitch?:number,loopStartSamples?:number}} SnesBRROptions */
/** Validate raw BRR and explicit musical tuning without allocating native RAM.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {SnesBRROptions} options
 */
export declare function prepareSnesBRR(input: ArrayBuffer | ArrayBufferView, options?: SnesBRROptions): {
    brr: Uint8Array<ArrayBuffer>;
    rootNote: string | number | null;
    rootFrequencyHz: any;
    basePitch: number;
    loop: boolean;
    loopStartSamples: any;
    frames: number;
};
export type SnesSample = {
    id: number;
    startAddress: number;
    loopAddress: number;
    byteLength: number;
    frames: number;
    rootNote: string | number | null;
    rootFrequencyHz: number;
    basePitch: number;
    loop: boolean;
    loopStartSamples: number | null;
};
export type SnesPreset = {
    sample?: number | SnesSample;
    adsr1?: number;
    adsr2?: number;
    gain?: number;
    volumeLeft?: number;
    volumeRight?: number;
    pitch?: number;
};
export type SnesVoiceState = {
    sample: number | null;
    adsr1: number;
    adsr2: number;
    gain: number;
    volumeLeft: number;
    volumeRight: number;
    pitch: number;
};
export type SnesState = {
    sampleRate: number;
    samples: SnesSample[];
    channels: SnesVoiceState[];
    nextAddress: number;
};
/** @typedef {{id:number,startAddress:number,loopAddress:number,byteLength:number,frames:number,
 * rootNote:string|number|null,rootFrequencyHz:number,basePitch:number,loop:boolean,loopStartSamples:number|null}} SnesSample
 */
/** @typedef {{sample?:number|SnesSample,adsr1?:number,adsr2?:number,gain?:number,
 * volumeLeft?:number,volumeRight?:number,pitch?:number}} SnesPreset
 */
/** @typedef {{sample:number|null,adsr1:number,adsr2:number,gain:number,volumeLeft:number,volumeRight:number,pitch:number}} SnesVoiceState */
/** @typedef {{sampleRate:number,samples:SnesSample[],channels:SnesVoiceState[],nextAddress:number}} SnesState */
/** Authored instruments over SnesDspCore. RAM $0000..$03ff is the 256-entry
 * sample directory; BRR uploads grow from $0400. No compaction/voice allocator.
 * Echo writes are disabled. Raw DSP edits may overwrite directory/echo settings
 * and must respect these RAM reservations. reset retains/reuploads samples.
 */
export declare class SnesSynth {
    core: import("./spc.js").SnesDspCore;
    sampleRate: number;
    channelCount: number; /** @type {SnesSample[]} */
    samples: any[];
    sampleBytes: any[];
    nextAddress: number;
    pendingKon: number;
    koff: number;
    konFrame: any;
    /** @type {SnesVoiceState[]} */
    channels: SnesVoiceState[];
    /** @param {{core:import('./spc.js').SnesDspCore}} options */
    constructor({ core }: {
        core: import('./spc.js').SnesDspCore;
    });
    /** DSP reset keeps sample uploads and their IDs; active voices are released. */
    reset(): void;
    _directory(sample: any): void;
    /** Upload complete raw BRR. Looped samples require explicit loopStartSamples;
     * tune with exactly one rootNote (note name/MIDI) or baseFrequencyHz.
     * basePitch is the raw DSP PITCH that plays this declared root (default4096).
     * @param {ArrayBuffer|ArrayBufferView} input
     * @param {SnesBRROptions} options
     * @returns {SnesSample} */
    loadBRR(input: ArrayBuffer | ArrayBufferView, options: SnesBRROptions): SnesSample;
    _preset(ch: any, preset: any): {
        sample: number | null;
        adsr1: number;
        adsr2: number;
        gain: number;
        volumeLeft: number;
        volumeRight: number;
        pitch: number;
    };
    _writeChannel(ch: any, p: any): void;
    /** Partial register-value preset; gain applies when ADSR1 bit7 is clear.
     * @param {number} ch Fixed physical voice0..7. @param {SnesPreset} preset */
    setPreset(ch: number, preset: SnesPreset): void;
    /** @param {number} ch @param {SnesPreset} params */
    setChannel(ch: number, params: SnesPreset): void;
    /** @param {number} ch @returns {SnesVoiceState} */
    getPreset(ch: number): SnesVoiceState;
    /** Explicit hardware PITCH0..16383; 4096 advances one source sample/frame.
     * @param {number} ch @param {number} pitch */
    setPitch(ch: number, pitch: number): void;
    /** Musical fundamental Hz relative to the uploaded sample's declared tuning.
     * @param {number} ch @param {number} hz */
    setFrequency(ch: number, hz: number): void;
    /** @param {number} ch @param {string|number} note Note name or integer MIDI. */
    setNote(ch: number, note: string | number): void;
    /** @param {number} ch */
    keyOn(ch: number): void;
    /** S-DSP KOFF release (fixed hardware release rate), no synthetic smoothing.
     * @param {number} ch */
    keyOff(ch: number): void;
    /** @param {number} ch @param {string|number} [note] */
    noteOn(ch: number, note?: string | number): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    allNotesOff(): void;
    /** Raw register edits can bypass sample/channel bookkeeping.
     * @param {number} register @param {number} value */
    writeDsp(register: number, value: number): void;
    /** @param {number} register @returns {number} */
    readDsp(register: number): number;
    /** @returns {{ram:Uint8Array,dsp:Uint8Array,nativeFrames:number}} */
    snapshot(): {
        ram: Uint8Array;
        dsp: Uint8Array;
        nativeFrames: number;
    };
    /** @returns {SnesState} */
    getState(): SnesState;
    /** Optional rendering convenience; core.renderInto() is equally supported.
     * Multiple keyOn calls at the same native frame form one KON mask.
     * @param {Float32Array} left @param {Float32Array} right @param {number} [frames] @param {number} [offset] */
    renderInto(left: Float32Array, right: Float32Array, frames?: number, offset?: number): void;
    dispose(): void;
}

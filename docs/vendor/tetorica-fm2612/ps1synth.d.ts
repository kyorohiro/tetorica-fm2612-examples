export declare const PS1_CHANNEL_COUNT = 24;
export type Ps1ADPCMOptions = ({
    rootNote: string | number;
    baseFrequencyHz?: never;
} | {
    baseFrequencyHz: number;
    rootNote?: never;
}) & {
    loopStartSamples?: number;
};
/** @typedef {({rootNote:string|number,baseFrequencyHz?:never}|{baseFrequencyHz:number,rootNote?:never}) & {loopStartSamples?:number}} Ps1ADPCMOptions */
/** Validate complete 16-byte / 28-frame SPU ADPCM packets and explicit tuning.
 * Predictors 0..4 and shifts 0..12 are accepted. END must be the final packet.
 * Looped data requires a packet-aligned loopStartSamples; any encoded LOOP START
 * marker must agree with it. A marker in one-shot data is retained but does not
 * enable repeating: only the END packet's Repeat bit does. The returned bytes
 * are an owned copy.
 * @param {ArrayBuffer|ArrayBufferView} input @param {Ps1ADPCMOptions} options
 * @returns {{adpcm:Uint8Array,rootNote:string|number|null,rootFrequencyHz:number,basePitch:number,loop:boolean,loopStartSamples:number|null,decodedFrames:number}}
 */
export declare function preparePs1ADPCM(input: ArrayBuffer | ArrayBufferView, options: Ps1ADPCMOptions): {
    adpcm: Uint8Array;
    rootNote: string | number | null;
    rootFrequencyHz: number;
    basePitch: number;
    loop: boolean;
    loopStartSamples: number | null;
    decodedFrames: number;
};
/** An original sine loop: the editor's .65-amplitude, 112-frame Sine encoded
 * ahead of time with preparePs1Waveform(). No encoder runs in the AudioWorklet.
 * The four packets loop at source frame 0; at PITCH 4096 their fundamental is
 * 44100/112 Hz. Mixer owns chip gain; this factory only supplies an instrument.
 */
export declare function createPs1InitSample(): {
    adpcm: Uint8Array<ArrayBuffer>;
    baseFrequencyHz: number;
    loopStartSamples: number;
};
export type Ps1Sample = {
    id: number;
    startAddress: number;
    repeatAddress: number;
    byteLength: number;
    decodedFrames: number;
    rootNote: string | number | null;
    rootFrequencyHz: number;
    basePitch: number;
    loop: boolean;
    loopStartSamples: number | null;
    editorChannel?: number;
};
export type Ps1Preset = {
    sample?: number | Ps1Sample;
    volumeLeft?: number;
    volumeRight?: number;
    adsr1?: number;
    adsr2?: number;
    pitch?: number;
    reverb?: boolean;
};
export type Ps1EnvelopeUpdateOptions = {
    live?: boolean;
};
export type Ps1VoiceState = {
    sample: number | null;
    volumeLeft: number;
    volumeRight: number;
    adsr1: number;
    adsr2: number;
    pitch: number;
    reverb: boolean;
};
export type Ps1ReverbState = import('./ps1_parameters.js').Ps1Reverb;
/** @typedef {{id:number,startAddress:number,repeatAddress:number,byteLength:number,decodedFrames:number,
 * rootNote:string|number|null,rootFrequencyHz:number,basePitch:number,loop:boolean,loopStartSamples:number|null,editorChannel?:number}} Ps1Sample */
/** @typedef {{sample?:number|Ps1Sample,volumeLeft?:number,volumeRight?:number,adsr1?:number,adsr2?:number,pitch?:number,reverb?:boolean}} Ps1Preset */
/** @typedef {{live?:boolean}} Ps1EnvelopeUpdateOptions */
/** @typedef {{sample:number|null,volumeLeft:number,volumeRight:number,adsr1:number,adsr2:number,pitch:number,reverb:boolean}} Ps1VoiceState */
/** @typedef {import('./ps1_parameters.js').Ps1Reverb} Ps1ReverbState */
/** Fixed physical voices 0..23 over Ps1Spu. Uploads grow from byte address 0x1000
 * with 16-byte alignment; reset({clearRam:true}) starts a new bank. There is no
 * compaction, voice allocator, automatic gain normalization or PCM encoder.
 * Direct core edits bypass this class's bookkeeping and RAM reservations.
 */
export declare class Ps1Synth {
    core: import("./ps1_spu.js").Ps1Spu;
    sampleRate: number;
    channelCount: number;
    /** @type {Ps1Sample[]} */ samples: Ps1Sample[];
    /** @type {Uint8Array[]} */ sampleBytes: Uint8Array[];
    /** @type {Array<null|{sample:number,pcm:number[]}>} */ editorWaveforms: Array<null | {
        sample: number;
        pcm: number[];
    }>;
    /** @type {Ps1VoiceState[]} */ channels: Ps1VoiceState[];
    /** @type {boolean[]} */ gates: boolean[];
    /** @type {Ps1ReverbState} */ reverb: Ps1ReverbState;
    nextAddress: number;
    disposed: boolean;
    /** @param {{core:import('./ps1_spu.js').Ps1Spu}} options */
    constructor({ core }: {
        core: import('./ps1_spu.js').Ps1Spu;
    });
    _open(): void;
    _enable(): void;
    /** Reset voice presets and gates. Samples/IDs are retained unless clearRam is
     * true, which clears RAM, descriptors and the upload allocator together.
     * @param {{clearRam?:boolean}} [options] */
    reset(options?: {
        clearRam?: boolean;
    }): void;
    /** Upload a complete, validated SPU ADPCM instrument; declared tuning is the
     * fundamental at hardware PITCH 4096 (one source frame per output frame).
     * @param {ArrayBuffer|ArrayBufferView} input @param {Ps1ADPCMOptions} options
     * @returns {Ps1Sample} */
    loadADPCM(input: ArrayBuffer | ArrayBufferView, options: Ps1ADPCMOptions): Ps1Sample;
    /** Internal editor upload. The fixed PCM cycle is encoded on the prepare
     * side; this method only validates and copies four packets. Its private slot
     * is reused, never shared with another physical voice or a public upload.
     * @param {number} ch @param {{pcm:number[],adpcm:Uint8Array}} value */
    _setWaveformPrepared(ch: number, value: {
        pcm: number[];
        adpcm: Uint8Array;
    }): {
        id: number;
        startAddress: number;
        repeatAddress: number;
        byteLength: number;
        decodedFrames: number;
        rootNote: string | number | null;
        rootFrequencyHz: number;
        basePitch: number;
        loop: boolean;
        loopStartSamples: number | null;
        editorChannel?: number;
    };
    /** Resource-only synchronization. Authoring/lookahead voice settings are
     * deliberately excluded, so an editor snapshot cannot overwrite a future
     * note or a script's requested pitch/envelope. */
    _getResources(): {
        samples: {
            id: number;
            startAddress: number;
            repeatAddress: number;
            byteLength: number;
            decodedFrames: number;
            rootNote: string | number | null;
            rootFrequencyHz: number;
            basePitch: number;
            loop: boolean;
            loopStartSamples: number | null;
            editorChannel?: number;
        }[];
        nextAddress: number;
        waveforms: ({
            sample: number;
            pcm: number[];
        } | null)[];
    };
    _adoptResources(state: any): void;
    _preset(ch: any, preset: any): {
        sample: number | null;
        volumeLeft: number;
        volumeRight: number;
        adsr1: number;
        adsr2: number;
        pitch: number;
        reverb: boolean;
    };
    _writeChannel(ch: any, p: any): void;
    _writeReverbSend(ch: any, enabled: any): void;
    _reverb(settings: any): {
        preset: import("./ps1_parameters.js").Ps1ReverbPreset;
        volumeLeft: number;
        volumeRight: number;
    };
    _writeReverb(settings: any): void;
    /** Partial voice preset. Fixed signed volumes use -1..1; ADSR1/2 are raw 16-bit
     * registers. Changed ADSR words update the current envelope stage without
     * restarting its sample or level. Set live:false to defer them to key-on.
     * @param {number} ch @param {Ps1Preset} preset @param {Ps1EnvelopeUpdateOptions} [options] */
    setPreset(ch: number, preset: Ps1Preset, options?: Ps1EnvelopeUpdateOptions): void;
    /** @param {number} ch @param {Ps1Preset} params @param {Ps1EnvelopeUpdateOptions} [options] */
    setChannel(ch: number, params: Ps1Preset, options?: Ps1EnvelopeUpdateOptions): void;
    /** Partial named ADSR controls. Rates are raw indexes (zero is fastest), and
     * changed fields update the active stage at its current level by default.
     * Attack edits during sustain affect a future attack. live:false retains the
     * old stage parameters until the next key-on or explicit live edit.
     * @param {number} ch @param {Partial<import('./ps1_parameters.js').Ps1Envelope>} settings
     * @param {Ps1EnvelopeUpdateOptions} [options] */
    setEnvelope(ch: number, settings: Partial<import('./ps1_parameters.js').Ps1Envelope>, options?: Ps1EnvelopeUpdateOptions): void;
    /** One shared approximate reverb. Per-voice `reverb` selects the send; these
     * independent return levels add wet sound to the unchanged dry sound.
     * Off retains requested levels but bypasses processing. Existing tails clear
     * only on Stop/reset, not on preset selection. Changes affect active voices.
     * @param {Partial<Ps1ReverbState>} settings */
    setReverb(settings: Partial<Ps1ReverbState>): void;
    /** @param {number} ch @returns {Ps1VoiceState} */
    getPreset(ch: number): Ps1VoiceState;
    /** Raw hardware pitch 0..16383. Zero holds the current sample position.
     * @param {number} ch @param {number} pitch */
    setPitch(ch: number, pitch: number): void;
    /** @param {number} ch @param {number} hz */
    setFrequency(ch: number, hz: number): void;
    /** @param {number} ch @param {string|number} note */
    setNote(ch: number, note: string | number): void;
    /** @param {number} ch */
    keyOn(ch: number): void;
    /** Release via the programmed ADSR release register, without changing others.
     * @param {number} ch */
    keyOff(ch: number): void;
    /** Editor-only transitions. Programmed notes keep the raw keyOn/keyOff API.
     * @param {number} ch */
    _auditionKeyOn(ch: number): void;
    /** @param {number} ch */
    _auditionKeyOff(ch: number): void;
    /** @param {number} ch */
    _refreshEnvelope(ch: number): void;
    /** @param {number} ch @param {string|number} [note] */
    noteOn(ch: number, note?: string | number): void;
    /** @param {number} ch */
    noteOff(ch: number): void;
    allNotesOff(): void;
    /** Immediate silence for transport Stop: clear decoder/envelopes/reverb while
     * preserving RAM, sample IDs, tuning and all programmed voice presets.
     * This also resets the core's native frame counter.
     */
    stopVoices(): void;
    /** Serializable metadata and requested key gates; ENVX/END reflect the core.
     * Sample byte payloads are available through snapshot(). */
    getState(): {
        sampleRate: number;
        channelCount: number;
        nextAddress: number;
        nativeFrames: number;
        samples: {
            id: number;
            startAddress: number;
            repeatAddress: number;
            byteLength: number;
            decodedFrames: number;
            rootNote: string | number | null;
            rootFrequencyHz: number;
            basePitch: number;
            loop: boolean;
            loopStartSamples: number | null;
            editorChannel?: number;
        }[];
        reverb: {
            preset: import("./ps1_parameters.js").Ps1ReverbPreset;
            volumeLeft: number;
            volumeRight: number;
        };
        channels: {
            sample: number | null;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            pitch: number;
            reverb: boolean;
            waveform: {
                sample: number;
                pcm: number[];
            } | null;
            envelopeParameters: import("./ps1_parameters.js").Ps1Envelope;
            gate: boolean;
            envelope: number;
            ended: boolean;
        }[];
    };
    /** Explicit, potentially large copy of RAM/registers for inspection. */
    snapshot(): {
        sampleRate: number;
        channelCount: number;
        nextAddress: number;
        nativeFrames: number;
        samples: {
            id: number;
            startAddress: number;
            repeatAddress: number;
            byteLength: number;
            decodedFrames: number;
            rootNote: string | number | null;
            rootFrequencyHz: number;
            basePitch: number;
            loop: boolean;
            loopStartSamples: number | null;
            editorChannel?: number;
        }[];
        reverb: {
            preset: import("./ps1_parameters.js").Ps1ReverbPreset;
            volumeLeft: number;
            volumeRight: number;
        };
        channels: {
            sample: number | null;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            pitch: number;
            reverb: boolean;
            waveform: {
                sample: number;
                pcm: number[];
            } | null;
            envelopeParameters: import("./ps1_parameters.js").Ps1Envelope;
            gate: boolean;
            envelope: number;
            ended: boolean;
        }[];
        ram: Uint8Array<ArrayBufferLike>;
        registers: Uint16Array<ArrayBuffer>;
    };
    /** @param {Float32Array} left @param {Float32Array} right @param {number} [frames] @param {number} [offset] */
    renderInto(left: Float32Array, right: Float32Array, frames?: number, offset?: number): void;
    dispose(): void;
}

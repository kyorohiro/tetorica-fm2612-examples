export declare const OKIM6258_CLOCK = 8000000;
export declare const OKIM6258_DIVIDERS: readonly number[];
export type Oki6258SampleMetadata = {
    frames: number;
    waveform: number[];
    sampleRate?: number;
    source?: 'raw' | 'sample';
    name?: string;
};
export type Oki6258Transport = {
    writeRegister: (register: number, value: number) => void;
    loadMemory: (bytes: Uint8Array, metadata?: Oki6258SampleMetadata) => void | Promise<void>;
    play: (options: {
        repeat: boolean;
    }) => void;
    stop: () => void;
    reset: () => void;
    dispose?: () => void;
};
/** @typedef {{frames:number,waveform:number[],sampleRate?:number,source?:'raw'|'sample',name?:string}} Oki6258SampleMetadata
 * @typedef {{writeRegister:(register:number,value:number)=>void,
 * loadMemory:(bytes:Uint8Array,metadata?:Oki6258SampleMetadata)=>void|Promise<void>,
 * play:(options:{repeat:boolean})=>void,stop:()=>void,reset:()=>void,dispose?:()=>void}} Oki6258Transport
 */
/** Choose an actual VCLK rate; the chip has three clock dividers, not a pitch register.
 * @param {number} clock @param {number} hz */
export declare function oki6258Rate(clock: number, hz: number): {
    divider: number;
    sampleRate: number;
};
/** Encode MAME-compatible OKI ADPCM4: low nibble first, initial predictor -2,
 * 12-bit output and the 49-entry OKI step table. Stereo PCM is averaged.
 * The final byte always contains two samples, with silence padding if needed.
 * @param {import('./wav.js').ChannelPCM} pcm
 * @param {number} outputRate
 * @param {number} [maxBytes]
 */
export declare function encodeOki6258({ channels, sampleRate }: import('./wav.js').ChannelPCM, outputRate: number, maxBytes?: number): {
    bytes: Uint8Array<ArrayBuffer>;
    frames: number;
    paddedFrames: number;
    sampleRate: number;
    durationSeconds: number;
};
/** Decode a bounded peak preview outside the audio render thread. No PCM-sized allocation.
 * @param {Uint8Array|ArrayBuffer} input @param {{bins?:number}} [options] */
export declare function summarizeOki6258(input: Uint8Array | ArrayBuffer, { bins }?: {
    bins?: number;
}): {
    frames: number;
    waveform: any[];
};
/** Portable control surface. Transport memory is acknowledged before playback. */
export declare class Oki6258Synth {
    transport: Oki6258Transport;
    _clock: number;
    divider: number;
    pan: number;
    sample: any;
    disposed: boolean;
    /** @param {{transport:Oki6258Transport,clock?:number}} options */
    constructor({ transport, clock }: {
        transport: Oki6258Transport;
        clock?: number;
    });
    get clock(): number;
    get playbackRate(): number;
    _assertLive(): void;
    _adoptHardwareClock(hz: any): void;
    _getState(): {
        clock: number;
        divider: number;
        pan: number;
        sample: any;
    };
    _adoptState(state: any): void;
    /** @param {number} divider */
    setDivider(divider: number): number;
    /** @param {number} hz */
    setPlaybackRate(hz: number): number;
    setPan(left?: boolean, right?: boolean): void;
    /** Load encoded 4-bit OKI bytes, low nibble first. PCM/WAV belongs in loadSample().
     * @param {Uint8Array|ArrayBuffer} input
     * @param {{sampleRate?:number}} [options]
     * @returns {Promise<void>}
     */
    loadMemory(input: Uint8Array | ArrayBuffer, { sampleRate }?: {
        sampleRate?: number;
    }): Promise<void>;
    /** PCM objects, AudioBuffer, WAV bytes, Blob and URL/path are accepted.
     * @param {unknown} source
     * @param {{sampleRate?:number,signal?:AbortSignal,decodeAudio?:(bytes:ArrayBuffer)=>Promise<AudioBuffer|import('./wav.js').ChannelPCM>}} [options]
     */
    loadSample(source: unknown, { sampleRate, signal, decodeAudio }?: {
        sampleRate?: number;
        signal?: AbortSignal;
        decodeAudio?: (bytes: ArrayBuffer) => Promise<AudioBuffer | import('./wav.js').ChannelPCM>;
    }): Promise<{
        frames: number;
        paddedFrames: number;
        sampleRate: number;
        durationSeconds: number;
        bytes: number;
    }>;
    play({ repeat }?: {
        repeat?: boolean | undefined;
    }): void;
    stop(): void;
    keyOff(): void;
    allNotesOff(): void;
    reset(): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    dispose(): void;
}
/** Feed the native chip's eight-byte FIFO without overruns or end-of-sample DC.
 * Every output frame advances the same fractional VCLK phase as the core.
 * A bounded segment never needs more than eight queued bytes. Repeats restart
 * the ADPCM predictor, so repeated phrases do not accumulate decoder drift.
 */
export declare class Oki6258Stream {
    engine: any;
    clock: number;
    divider: number;
    pan: number;
    bytes: Uint8Array<ArrayBuffer>;
    playing: boolean;
    streaming: boolean;
    phase: number;
    position: number;
    fedBytes: number;
    clockBuffer: number | undefined;
    repeat: boolean | undefined;
    constructor(engine: any, { clock }?: {
        clock?: number | undefined;
    });
    _configure(): void;
    _validateRate(clock: any, divider: any): void;
    setClock(clock: any): void;
    writeRegister(register: any, value: any): void;
    loadMemory(bytes: any): void;
    play({ repeat }?: {
        repeat?: boolean | undefined;
    }): void;
    _restart(): void;
    stop(): void;
    reset(): void;
    process(left: any, right: any): void;
}

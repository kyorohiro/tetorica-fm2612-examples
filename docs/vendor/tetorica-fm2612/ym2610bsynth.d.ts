/**
 * @file ym2610bsynth.js
 * 実行環境: Browser / Node.js（クラスにより異なる）
 * 依存: 低レベル Synth / DirectTransport は注入したチップで動作し、Node.js でも使用可能。
 * RuntimeSynth 系の実再生は OPNRuntimeSynth 経由で AudioContext / AudioWorkletNode / fetch を使う。
 */
import { OPNDirectTransport, OPNFMSynth } from "./opn_fm_synth.js";
import { OPNRuntimeSynth } from "./opn_runtime_synth.js";
import { SSGSynth } from "./ssgsynth.js";
export declare class YM2610BDirectTransport extends OPNDirectTransport {
    constructor(chip: any);
    /** Transfer encoded A/B data. Keep the full address space so later loads never truncate earlier samples. */
    loadAdpcmMemory(type: any, bytes: any, address: any): any;
}
/** YM2610B ADPCM-B external-memory playback, using ROM addressing (256-byte units).
 * Browser / Worker / Node.js: no file decoding, audio output or memory ownership here.
 */
export declare class YM2610BAdpcmBSynth {
    transport: {
        write: (register: number, value: number) => void;
        loadMemory: (bytes: Uint8Array, address: number) => void;
    };
    clock: number;
    registers: Uint8Array<ArrayBuffer> | undefined;
    /** @param {{write: (register: number, value: number) => void, loadMemory: (bytes: Uint8Array, address: number) => void}} transport
     * @param {number} clock Master clock in Hz; rate conversion assumes standard FM prescaling.
     */
    constructor(transport: {
        write: (register: number, value: number) => void;
        loadMemory: (bytes: Uint8Array, address: number) => void;
    }, clock?: number);
    /** Clear the register shadow after the parent chip resets. Memory is preserved. */
    resetState(): void;
    /** Track normalized ADPCM-B writes through the parent Synth. */
    observeWrite(register: any, value: any): void;
    _write(register: any, value: any): void;
    /** Transfer encoded ADPCM-B, not WAV, PCM or rhythm ADPCM-A.
     * @param {Uint8Array|ArrayBuffer} bytes
     * @param {number} [address=0] Byte offset in the 16 MiB memory.
     */
    loadMemory(bytes: Uint8Array | ArrayBuffer, address?: number): void;
    /** Configure a byte range [start, end). Both boundaries must be 256-byte aligned.
     * Call while stopped. The chip uses fixed ROM addressing.
     * @param {{start: number, end: number}} range End is exclusive, unlike the hardware register.
     */
    setSample({ start, end }: {
        start: number;
        end: number;
    }): void;
    /** Set raw Delta-N 1..65535. Can change while playing. */
    setDeltaN(value: any): void;
    /** Set decoded PCM samples/second, not byte rate. Returns the quantized actual rate.
     * A byte contains two samples; changing this rate changes both speed and pitch.
     */
    setPlaybackRate(rate: any): number;
    /** Linear level 0..255 (0=silence). */
    setVolume(volume: any): void;
    /** Stereo gates; preserves memory-mode bits from raw register writes. */
    setPan(left: any, right: any): void;
    /** Start/retrigger the selected range. Repeat loops the entire range, not a separate loop point. */
    keyOn({ repeat }?: {
        repeat?: boolean | undefined;
    }): void;
    /** Stop and clear decoder history on the next synthesis update. */
    keyOff(): void;
    /** Reset ADPCM-B controls only, retaining sample memory and all other sound sources. */
    reset(): void;
}
/** Six independent ADPCM-A ROM voices. Fixed decoded rate clock/432; no hardware repeat or pitch control. */
export declare class YM2610BAdpcmASynth {
    transport: {
        write: (register: number, value: number) => void;
        loadMemory: (bytes: Uint8Array, address: number) => void;
    };
    levels: Uint8Array<ArrayBuffer> | undefined;
    /** @param {{write: (register: number, value: number) => void, loadMemory: (bytes: Uint8Array, address: number) => void}} transport */
    constructor(transport: {
        write: (register: number, value: number) => void;
        loadMemory: (bytes: Uint8Array, address: number) => void;
    });
    /** Reset only the register shadow after a whole-chip reset. */
    resetState(): void;
    /** Track normalized port-1 register writes. */
    observeWrite(reg: any, value: any): void;
    /** Transfer ADPCM-A bytes (not ADPCM-B or WAV) into the 16 MiB ROM address space. */
    loadMemory(bytes: any, address?: number): void;
    /** Select [start,end) byte addresses on a voice 0..5, both aligned to 256 bytes.
     * Limit each range to less than 1 MiB: the core compares only the low 20 address bits at the end.
     */
    setSample(ch: any, { start, end }: {
        end: any;
        start: any;
    }): void;
    /** Global hardware level 0..63, increasing loudness. */
    setVolume(volume: any): void;
    /** Individual level 0..31 and stereo gates; omitted values are retained. */
    /** @param {number} ch @param {{volume?: number, left?: boolean, right?: boolean}} [options] */
    setVoice(ch: number, { volume, left, right }?: {
        volume?: number;
        left?: boolean;
        right?: boolean;
    }): void;
    /** Trigger a voice or array of voices, restarting each from its selected start. */
    keyOn(voices: any): void;
    /** Stop a voice or array of voices. */
    keyOff(voices: any): void;
    _key(voices: any, off: any): void;
    /** Stop/reset A controls and ranges, preserving ROM and other sound sources. */
    reset(): void;
}
/** Six-channel FM, CH3 special, SSG, and separate ADPCM-A/B ROM playback. */
export declare class YM2610BSynth extends OPNFMSynth {
    ssg: SSGSynth;
    adpcmA: YM2610BAdpcmASynth;
    adpcmB: YM2610BAdpcmBSynth;
    adpcm: YM2610BAdpcmBSynth;
    /** @param {{transport: OPNDirectTransport, clock?: number}} options Master clock in Hz, default 8 MHz. */
    constructor({ transport, clock }?: {
        transport: OPNDirectTransport;
        clock?: number;
    });
    /** Reset the chip, retaining ROM contents. */
    reset(): void;
    _write(port: any, register: any, value: any): void;
}
/** Browser-hosted full YM2610B core. */
export declare class YM2610BRuntimeSynth extends OPNRuntimeSynth {
    constructor(options?: {});
}
/**
 * Neo Geo exposes four YM2610 FM channels. They are not the first four OPN
 * channels, so this facade maps compact logical channels to hardware ones.
 */
export declare class NeoGeoFMSynth {
    #private;
    fm: any;
    channelCount: number;
    constructor(fm: any);
    reset(): void;
    write(...args: any[]): any;
    read(...args: any[]): any;
    readStatus(...args: any[]): any;
    getIrq(...args: any[]): any;
    setLfo(...args: any[]): any;
    setChannel3SpecialMode(...args: any[]): any;
    setChannel3SpecialFrequency(...args: any[]): any;
    setPreset(channel: any, ...args: any[]): any;
    setOperators(channel: any, ...args: any[]): any;
    setOperator(channel: any, ...args: any[]): any;
    setAlgo(channel: any, ...args: any[]): any;
    setPan(channel: any, ...args: any[]): any;
    setModulation(channel: any, ...args: any[]): any;
    setFrequency(channel: any, ...args: any[]): any;
    keyOn(channel: any, ...args: any[]): any;
    keyOff(channel: any, ...args: any[]): any;
    noteOn(channel: any, ...args: any[]): any;
    noteOff(channel: any, ...args: any[]): any;
}
/** Neo Geo YM2610 profile built on the YM2610B core. */
export declare class NeoGeoSynth extends YM2610BRuntimeSynth {
    chip: string;
    capabilities: Readonly<{
        chip: "ym2610";
        fmChannels: 4;
        psg: false;
        dac: false;
        recorder: false;
    }>;
    rawFm: any;
    constructor(options?: {});
    start(): Promise<this>;
}

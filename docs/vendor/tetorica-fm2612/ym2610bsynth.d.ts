/**
 * @file ym2610bsynth.js
 * 実行環境: Browser / Node.js（クラスにより異なる）
 * 依存: 低レベル Synth / DirectTransport は注入したチップで動作し、Node.js でも使用可能。
 * RuntimeSynth 系の実再生は OPNRuntimeSynth 経由で AudioContext / AudioWorkletNode / fetch を使う。
 */
import { OPNDirectTransport, OPNFMSynth } from "./opn_fm_synth.js";
import { OPNRuntimeSynth } from "./opn_runtime_synth.js";
import { SSGSynth } from "./ssgsynth.js";
/** @extends {OPNDirectTransport<import('./ym2610b.js').Ym2610B>} */
export declare class YM2610BDirectTransport extends OPNDirectTransport<import('./ym2610b.js').Ym2610B> {
    /** @param {import('./ym2610b.js').Ym2610B} chip */
    constructor(chip: import('./ym2610b.js').Ym2610B);
    /** Transfer encoded A/B data. Keep the full address space so later loads never truncate earlier samples. @param {Uint8Array} bytes @param {number} address  @param {0|1} type */
    loadAdpcmMemory(type: 0 | 1, bytes: Uint8Array, address: number): void;
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
    /** Track normalized ADPCM-B writes through the parent Synth. @param {number} register  @param {number} value */
    observeWrite(register: number, value: number): void;
    /** @param {number} register  @param {number} value */
    _write(register: number, value: number): void;
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
     * @param {number} rate
     */
    setPlaybackRate(rate: number): number;
    /** Linear level 0..255 (0=silence). @param {number} volume */
    setVolume(volume: number): void;
    /** Stereo gates; preserves memory-mode bits from raw register writes.  @param {boolean} right  @param {boolean} left */
    setPan(left: boolean, right: boolean): void;
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
    /** Track normalized port-1 register writes.  @param {number} value */
    observeWrite(reg: any, value: number): void;
    /** Transfer ADPCM-A bytes (not ADPCM-B or WAV) into the 16 MiB ROM address space. @param {Uint8Array} bytes @param {number} [address] */
    loadMemory(bytes: Uint8Array, address?: number): void;
    /** Select [start,end) byte addresses on a voice 0..5, both aligned to 256 bytes.
     * Limit each range to less than 1 MiB: the core compares only the low 20 address bits at the end.
     * @param {number} ch
     */
    setSample(ch: number, { start, end }: {
        end: any;
        start: any;
    }): void;
    /** Global hardware level 0..63, increasing loudness. @param {number} volume */
    setVolume(volume: number): void;
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
    /** @param {{transport: import('./opn_fm_synth.js').OPNTransport, clock?: number}} options Master clock in Hz, default 8 MHz. */
    constructor({ transport, clock }?: {
        transport: import('./opn_fm_synth.js').OPNTransport;
        clock?: number;
    });
    /** Reset the chip, retaining ROM contents. */
    reset(): void;
    /** @param {number} port
     * @param {number} value
     * @param {number} register */
    _write(port: number, register: number, value: number): void;
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
    get transport(): any;
    get clock(): any;
    set clock(hz: any);
    reset(): void;
    write(...args: any[]): any;
    read(...args: any[]): any;
    readStatus(...args: any[]): any;
    getIrq(...args: any[]): any;
    setLfo(...args: any[]): any;
    setChannel3SpecialMode(...args: any[]): any;
    setChannel3SpecialFrequency(...args: any[]): any;
    /** @param {number} channel */
    setPreset(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setOperators(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setOperator(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setAlgo(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setPan(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setModulation(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    setNote(channel: number, note: any): any;
    setBlockFnum(channel: any, block: any, fnum: any): any;
    noteOnRaw(channel: any, block: any, fnum: any): any;
    setFrequency(channel: any, ...args: any[]): any;
    /** @param {number} channel */
    keyOn(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    keyOff(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    noteOn(channel: number, ...args: any[]): any;
    /** @param {number} channel */
    noteOff(channel: number, ...args: any[]): any;
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

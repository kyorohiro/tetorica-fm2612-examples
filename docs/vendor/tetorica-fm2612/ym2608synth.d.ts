/**
 * @file ym2608synth.js
 * 実行環境: Browser / Node.js（クラスにより異なる）
 * 依存: 低レベル Synth / DirectTransport は注入したチップで動作し、Node.js でも使用可能。
 * RuntimeSynth 系の実再生は OPNRuntimeSynth 経由で AudioContext / AudioWorkletNode / fetch を使う。
 */
import { OPNDirectTransport, OPNWorkletTransport, OPNFMSynth } from "./opn_fm_synth.js";
import { OPNRuntimeSynth } from "./opn_runtime_synth.js";
/** Direct transport for YM2608 register operations. */
/** @extends {OPNDirectTransport<import('./ym2608.js').Ym2608>} */
export declare class YM2608DirectTransport extends OPNDirectTransport<import('./ym2608.js').Ym2608> {
    /** @param {import('./ym2608.js').Ym2608} chip */
    constructor(chip: import('./ym2608.js').Ym2608);
    /** Transfer caller-provided rhythm ROM to the core. @param {Uint8Array} bytes */
    loadRhythmRom(bytes: Uint8Array): void;
    /** Transfer already encoded ADPCM-B bytes to external sample memory. @param {Uint8Array} bytes @param {number} offset */
    loadAdpcmMemory(bytes: Uint8Array, offset: number): void;
}
export declare class YM2608WorkletTransport extends OPNWorkletTransport {
    /** @param {AudioWorkletNode|MessagePort|import('./soundchip_worklet.js').WorkletSoundChip} endpoint */
    constructor(endpoint: AudioWorkletNode | MessagePort | import('./soundchip_worklet.js').WorkletSoundChip);
}
/** YM2608's six fixed rhythm voices. Names follow the ROM's hardware order. */
export declare const YM2608_RHYTHM_VOICES: Readonly<{
    bassDrum: 0;
    snare: 1;
    cymbal: 2;
    hiHat: 3;
    tom: 4;
    rimShot: 5;
}>;
/** Register control for the fixed rhythm ROM; does not decode WAV or allocate PCM voices. */
export declare class YM2608RhythmSynth {
    transport: {
        write: (register: number, value: number) => void;
        loadRom: (bytes: Uint8Array) => void;
    };
    levels: Uint8Array<ArrayBuffer> | undefined;
    /** @param {{write: (register: number, value: number) => void, loadRom: (bytes: Uint8Array) => void}} transport */
    constructor(transport: {
        write: (register: number, value: number) => void;
        loadRom: (bytes: Uint8Array) => void;
    });
    /** Clear the register shadow after a whole-chip reset, without bus writes. */
    resetState(): void;
    /** Track raw port-0 writes made through the parent Synth. @param {number} register  @param {number} value */
    observeWrite(register: number, value: number): void;
    /** Load the complete 8 KiB rhythm ROM supplied by the caller. No ROM is bundled here.
     * @param {Uint8Array} bytes Encoded ADPCM-A ROM, not WAV or ADPCM-B.
     */
    loadRom(bytes: Uint8Array): void;
    /** Set global hardware level 0..63; larger values are louder. @param {number} volume */
    setVolume(volume: number): void;
    /** Set one voice's hardware level 0..31 and/or stereo gates; omitted settings are preserved.
     * @param {number|string} voice 0..5 or a key of YM2608_RHYTHM_VOICES.
     * @param {{volume?: number, left?: boolean, right?: boolean}} options
     */
    setVoice(voice: number | string, { volume, left, right }?: {
        volume?: number;
        left?: boolean;
        right?: boolean;
    }): void;
    /** Trigger one voice or an array simultaneously. Repeated calls retrigger from its fixed ROM start. */
    keyOn(voices: any): void;
    /** Stop one voice or an array immediately; this is not an FM envelope release. */
    keyOff(voices: any): void;
    _key(voices: any, off: any): void;
    /** Stop all rhythm voices and clear their controls; preserve ROM, FM, SSG and ADPCM-B. */
    reset(): void;
}
/** YM2608 ADPCM-B external-memory playback, using 8-bit DRAM addressing (32-byte units).
 * Browser / Worker / Node.js. loadSample decodes PCM WAV without an audio device.
 */
export declare class YM2608AdpcmSynth {
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
    /** Track raw port-1 writes through the parent Synth. @param {number} register  @param {number} value */
    observeWrite(register: number, value: number): void;
    /** @param {number} register  @param {number} value */
    _write(register: number, value: number): void;
    /** Transfer encoded ADPCM-B, not WAV, PCM or rhythm ADPCM-A.
     * @param {Uint8Array|ArrayBuffer} bytes
     * @param {number} [address=0] Byte offset in the 2 MiB memory.
     */
    loadMemory(bytes: Uint8Array | ArrayBuffer, address?: number): void;
    /** Decode PCM/AudioBuffer/WAV, mix to mono, encode ADPCM-B and select it.
     * Does not start playback. The caller owns memory allocation: repeated calls
     * at the same address replace the data. Range padding may add up to 63 frames.
     * @param {*} source Decoded {channels, sampleRate}, AudioBuffer, WAV bytes, Blob or path/URL.
     * @param {{address?: number, sampleRate?: number, signal?: AbortSignal, decodeAudio?: Function}} options
     * @returns {Promise<{start:number,end:number,frames:number,paddedFrames:number,sampleRate:number,deltaN:number,duration:number}>}
     */
    loadSample(source: any, { address, sampleRate, signal, decodeAudio }?: {
        address?: number;
        sampleRate?: number;
        signal?: AbortSignal;
        decodeAudio?: Function;
    }): Promise<{
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        sampleRate: number;
        deltaN: number;
        duration: number;
    }>;
    /** Configure a byte range [start, end). Both boundaries must be 32-byte aligned.
     * Selects 8-bit DRAM mode and the full 2 MiB address limit; call while stopped.
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
/** Six-channel FM (including CH3 special), three-channel SSG, fixed-ROM rhythm and ADPCM-B playback. */
export declare class YM2608Synth extends OPNFMSynth {
    adpcm: YM2608AdpcmSynth;
    rhythm: YM2608RhythmSynth;
    ssg: any;
    /** @param {{transport: import('./opn_fm_synth.js').OPNTransport, clock?: number}} options
     * clock is the master clock in Hz. SSG frequency helpers assume standard prescaling.
     */
    constructor({ transport, clock }?: {
        transport: import('./opn_fm_synth.js').OPNTransport;
        clock?: number;
    });
    /** Reset the chip and enable all six FM channels, preserving default IRQ enables. */
    reset(): void;
    /** @param {number} port
     * @param {number} value
     * @param {number} register */
    _write(port: number, register: number, value: number): void;
}
/** Browser-hosted YM2608 FM synth with shared Tetorica audio services. */
export declare class YM2608RuntimeSynth extends OPNRuntimeSynth {
    constructor(options?: {});
}

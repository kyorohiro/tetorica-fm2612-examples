/**
 * @file ym2610baudioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2610B } from "./ym2610b.js";
/** YM2610 / YM2610B FM, SSG and ADPCM playback engine. */
export declare class Ym2610BAudioEngine {
    #private;
    chip: Ym2610B;
    chipSampleRate: number;
    outputSampleRate: number;
    masterVolume: number;
    remainder: number;
    lastLeft: number;
    lastRight: number;
    sourceMuteMask: number;
    /** @param {Ym2610B} chip
     * @param {number} chipSampleRate
     * @param {number} outputSampleRate
     * @param {number} [masterVolume] */
    constructor(chip: Ym2610B, chipSampleRate: number, outputSampleRate: number, masterVolume?: number);
    /**
     * Create the chip instances required by this engine.
     * @param {{moduleFactory: import('./soundchip.js').WasmModuleFactory, moduleOptions?: import('./soundchip.js').WasmModuleOptions, clock?: number, outputSampleRate?: number, masterVolume?: number, variant?: boolean}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2610BAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        moduleOptions?: import('./soundchip.js').WasmModuleOptions;
        clock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
        variant?: boolean;
    }): Promise<Ym2610BAudioEngine>;
    supportsState(): boolean;
    stateSettingsKey(): string;
    /** @returns {Readonly<{byteLength:number}>} Opaque snapshot owned by this instance. */
    saveState(): Readonly<{
        byteLength: number;
    }>;
    /** @param {Readonly<{byteLength:number}>} state Snapshot returned by this instance. */
    validateState(state: Readonly<{
        byteLength: number;
    }>): void;
    /** @param {Readonly<{byteLength:number}>} state Snapshot returned by this instance. */
    loadState(state: Readonly<{
        byteLength: number;
    }>): void;
    /**
     * Release the underlying chips and their resources. Do not render after disposal.
     * @returns {void}
     */
    dispose(): void;
    /**
     * Reset chip/playback state for a new pass. This is not pause/resume; replay setup writes afterward.
     * @returns {void}
     */
    reset(): void;
    /**
     * Return the rate used by process() and processFrames().
     * @returns {number} Output stereo frames per second (Hz).
     */
    sampleRate(): number;
    /**
     * Set the linear master gain; validation/clamping follows this engine.
     * @param {number} value Gain multiplier, not dB.
     */
    setMasterVolume(value: number): number;
    /**
     * Read the current linear master gain.
     * @returns {number} Gain multiplier, not a dB value.
     */
    getMasterVolume(): number;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} port Chip register bank/port (not a MIDI channel).
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeYm2610B(port: number, register: number, value: number): void;
    /** @param {Uint8Array} data
     * @param {0|1} type
     * @param {number} size
     * @param {number} offset */
    loadAdpcmRom(type: 0 | 1, data: Uint8Array, offset: number, size: number): void;
    clearAdpcmRoms(): void;
    /** @param {boolean} muted */
    setSsgMuted(muted: boolean): void;
    /** @param {boolean} muted */
    setRhythmMuted(muted: boolean): void;
    /** @param {boolean} muted */
    setAdpcmBMuted(muted: boolean): void;
    /** @param {boolean} muted  @param {number} bit */
    setSourceMuted(bit: number, muted: boolean): void;
    /**
     * Advance synthesis and fill caller-owned stereo buffers.
     * @param {Float32Array} left Left output buffer with capacity for frames samples.
     * @param {Float32Array} right Right output buffer with capacity for frames samples.
     * @param {number} frames Nonnegative integer output frame count; not VGM wait samples.
     */
    process(left: Float32Array, right: Float32Array, frames: number): void;
    /**
     * Allocate stereo output and advance synthesis.
     * @param {number} frames Nonnegative integer frame count at sampleRate().
     * @returns {{left:Float32Array,right:Float32Array}} Rendered stereo output.
     */
    processFrames(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
}
/** @param {Parameters<typeof Ym2610BAudioEngine.create>[0]} [options] */
export declare function createYm2610BAudioEngine(options?: Parameters<typeof Ym2610BAudioEngine.create>[0]): Promise<Ym2610BAudioEngine>;

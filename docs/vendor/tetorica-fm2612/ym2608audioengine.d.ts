/**
 * @file ym2608audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2608 } from "./ym2608.js";
/**
 * Ym2608AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ym2608AudioEngine {
    #private;
    ym2608: Ym2608;
    _chipSampleRate: number;
    _sampleRate: number;
    _masterVolume: number;
    _sourceMuteMask: number;
    _rhythmRomRevision: number;
    _resampleRemainder: number;
    _lastLeft: number;
    _lastRight: number;
    /** @param {Ym2608} ym2608
     * @param {number} chipSampleRate
     * @param {number} outputSampleRate
     * @param {number} [masterVolume] */
    constructor(ym2608: Ym2608, chipSampleRate: number, outputSampleRate: number, masterVolume?: number);
    /**
     * Create the chip instances required by this engine.
     * @param {{ym2608ModuleFactory: import('./soundchip.js').WasmModuleFactory, ym2608ModuleOptions?: import('./soundchip.js').WasmModuleOptions, ym2608Clock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2608AudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        ym2608ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        ym2608ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2608Clock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ym2608AudioEngine>;
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
     * @param {number} volume Gain multiplier, not dB.
     */
    setMasterVolume(volume: number): number;
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
    writeYm2608(port: number, register: number, value: number): void;
    /** @param {Uint8Array} bytes
     * @param {number} [offset] */
    loadAdpcmARom(bytes: Uint8Array, offset?: number): void;
    /** @param {Uint8Array} bytes
     * @param {number} memorySize
     * @param {number} offset */
    loadAdpcmBMemory(bytes: Uint8Array, offset: number | undefined, memorySize: number): void;
    clearAdpcmBMemory(): void;
    /** @param {boolean} muted */
    setSsgMuted(muted: boolean): void;
    /** @param {boolean} muted */
    setRhythmMuted(muted: boolean): void;
    /** @param {boolean} muted */
    setAdpcmBMuted(muted: boolean): void;
    /** @param {boolean} muted  @param {number} bit */
    setSourceMuted(bit: number, muted: boolean): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} _value Ignored; this engine has no Sega PSG output.
     */
    writePsg(_value: number): void;
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
/** @param {Parameters<typeof Ym2608AudioEngine.create>[0]} [options] */
export declare function createYm2608AudioEngine(options?: Parameters<typeof Ym2608AudioEngine.create>[0]): Promise<Ym2608AudioEngine>;

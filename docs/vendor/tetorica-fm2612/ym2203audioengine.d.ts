/**
 * @file ym2203audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2203 } from "./ym2203.js";
/**
 * Ym2203AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ym2203AudioEngine {
    #private;
    ym2203: Ym2203;
    _chipSampleRate: number;
    _sampleRate: number;
    _masterVolume: number;
    _sourceMuteMask: number;
    channelMuteMask: number;
    _resampleRemainder: number;
    _lastLeft: number;
    _lastRight: number;
    /** @param {Ym2203} ym2203
     * @param {number} chipSampleRate
     * @param {number} outputSampleRate
     * @param {number} [masterVolume] */
    constructor(ym2203: Ym2203, chipSampleRate: number, outputSampleRate: number, masterVolume?: number);
    /**
     * Create the chip instances required by this engine.
     * @param {{ym2203ModuleFactory: import('./soundchip.js').WasmModuleFactory, ym2203ModuleOptions?: import('./soundchip.js').WasmModuleOptions, ym2203Clock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2203AudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        ym2203ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        ym2203ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2203Clock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ym2203AudioEngine>;
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
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeYm2203(register: number, value: number): void;
    /**
     * Change one physical channel mute flag.
     * @param {number} channel Zero-based physical channel index, not a MIDI part.
     * @param {boolean} muted True to suppress the channel.
     * @returns {void}
     */
    setChannelMuted(channel: number, muted: boolean): void;
    /** @param {boolean} muted */
    setSsgMuted(muted: boolean): void;
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
/** @param {Parameters<typeof Ym2203AudioEngine.create>[0]} [options] */
export declare function createYm2203AudioEngine(options?: Parameters<typeof Ym2203AudioEngine.create>[0]): Promise<Ym2203AudioEngine>;

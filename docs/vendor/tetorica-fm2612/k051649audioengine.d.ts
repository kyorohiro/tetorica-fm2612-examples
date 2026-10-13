/**
 * @file k051649audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { K051649 } from './k051649.js';
/**
 * K051649AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class K051649AudioEngine {
    k051649: K051649;
    channelMask: number;
    muted: boolean;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {{moduleFactory: import('./soundchip.js').WasmModuleFactory, moduleOptions?: import('./soundchip.js').WasmModuleOptions, clock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<K051649AudioEngine>} Initialized engine owned by the caller.
     */
    static create({ moduleFactory, moduleOptions, clock, outputSampleRate, masterVolume }?: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        moduleOptions?: import('./soundchip.js').WasmModuleOptions;
        clock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<K051649AudioEngine>;
    /** @param {K051649} chip
     * @param {number} [volume] */
    constructor(chip: K051649, volume?: number);
    /**
     * Return the rate used by process() and processFrames().
     * @returns {number} Output stereo frames per second (Hz).
     */
    sampleRate(): number;
    /**
     * Reset chip/playback state for a new pass. This is not pause/resume; replay setup writes afterward.
     * @returns {void}
     */
    reset(): void;
    /**
     * Release the underlying chips and their resources. Do not render after disposal.
     * @returns {void}
     */
    dispose(): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} port Chip register bank/port (not a MIDI channel).
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeK051649(port: number, register: number, value: number): void;
    /** @param {boolean} muted */
    setSccMuted(muted: boolean): void;
    /** @param {number} channel
     * @param {boolean} muted */
    setSccChannelMuted(channel: number, muted: boolean): void;
    applyMute(): void;
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
     * Allocate stereo output and advance synthesis.
     * @param {number} frames Nonnegative integer frame count at sampleRate().
     * @returns {{left:Float32Array,right:Float32Array}} Rendered stereo output.
     */
    processFrames(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    /**
     * Advance synthesis and fill caller-owned stereo buffers.
     * @param {Float32Array} left Left output buffer with capacity for frames samples.
     * @param {Float32Array} right Right output buffer with capacity for frames samples.
     * @param {number} frames Nonnegative integer output frame count; not VGM wait samples.
     */
    process(left: Float32Array, right: Float32Array, frames: number): void;
}
/** @param {Parameters<typeof K051649AudioEngine.create>[0]} [options] */
export declare const createK051649AudioEngine: (options?: Parameters<typeof K051649AudioEngine.create>[0]) => Promise<K051649AudioEngine>;

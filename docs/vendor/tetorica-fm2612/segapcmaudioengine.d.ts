/**
 * @file segapcmaudioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { SegaPcm } from './segapcm.js';
import { SegaPSG } from './segapsg.js';
/**
 * SegaPcmAudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class SegaPcmAudioEngine {
    segapcm: SegaPcm;
    psg: SegaPSG | undefined;
    channelMask: number;
    muted: boolean;
    psgMuted: boolean;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {{moduleFactory: import('./soundchip.js').WasmModuleFactory, moduleOptions?: import('./soundchip.js').WasmModuleOptions, clock?: number, bankShift?: number, bankMask?: number, segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory, psgClock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<SegaPcmAudioEngine>} Initialized engine owned by the caller.
     */
    static create({ moduleFactory, moduleOptions, clock, bankShift, bankMask, segaPsgModuleFactory, psgClock, outputSampleRate, masterVolume }?: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        moduleOptions?: import('./soundchip.js').WasmModuleOptions;
        clock?: number;
        bankShift?: number;
        bankMask?: number;
        segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        psgClock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<SegaPcmAudioEngine>;
    /** @param {SegaPcm} chip
     * @param {SegaPSG | undefined} psg
     * @param {number} [volume] */
    constructor(chip: SegaPcm, psg: SegaPSG | undefined, volume?: number);
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
     * @param {number} offset Chip address offset.
     * @param {number} value Register/command data value.
     */
    writeSegaPcm(offset: number, value: number): void;
    /** @param {Uint8Array} data
     * @param {number} memorySize
     * @param {number} offset */
    loadSampleMemory(data: Uint8Array, offset: number, memorySize: number): void;
    clearSampleMemory(): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} value Register/command data value.
     */
    writePsg(value: number): void;
    /** @param {boolean} value */
    setPsgChannelMuted(channel: any, muted: any): void;
    setPsgMuted(value: any): void;
    /** @param {boolean} muted */
    setSegaPcmMuted(muted: boolean): void;
    /** @param {number} channel
     * @param {boolean} muted */
    setSegaPcmChannelMuted(channel: number, muted: boolean): void;
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
/** @param {Parameters<typeof SegaPcmAudioEngine.create>[0]} [options] */
export declare const createSegaPcmAudioEngine: (options?: Parameters<typeof SegaPcmAudioEngine.create>[0]) => Promise<SegaPcmAudioEngine>;

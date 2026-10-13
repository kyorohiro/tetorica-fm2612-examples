/**
 * @file y8950audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Y8950 } from './y8950.js';
import { SegaPSG } from './segapsg.js';
/**
 * Y8950AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Y8950AudioEngine {
    y8950: Y8950;
    psg: SegaPSG | undefined;
    chipRate: number;
    outputRate: number;
    psgMuted: boolean;
    channelMask: number;
    adpcmMuted: boolean;
    muted: boolean;
    remainder: number;
    lastLeft: number;
    lastRight: number;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {{y8950ModuleFactory: import('./soundchip.js').WasmModuleFactory, y8950ModuleOptions?: import('./soundchip.js').WasmModuleOptions, y8950Clock?: number, segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory, psgClock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Y8950AudioEngine>} Initialized engine owned by the caller.
     */
    static create({ y8950ModuleFactory, y8950ModuleOptions, y8950Clock, segaPsgModuleFactory, psgClock, outputSampleRate, masterVolume }?: {
        y8950ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        y8950ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        y8950Clock?: number;
        segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        psgClock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Y8950AudioEngine>;
    /** @param {Y8950} chip
     * @param {SegaPSG | undefined} psg
     * @param {number} chipRate
     * @param {number} outputRate
     * @param {number} volume */
    constructor(chip: Y8950, psg: SegaPSG | undefined, chipRate: number, outputRate: number, volume: number);
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
     * Change one physical channel mute flag.
     * @param {number} channel Zero-based physical channel index, not a MIDI part.
     * @param {boolean} value True to suppress the channel.
     * @returns {void}
     */
    setChannelMuted(channel: number, value: boolean): void;
    /** @param {boolean} value */
    setAdpcmMuted(value: boolean): void;
    /** @param {boolean} value */
    setY8950Muted(value: boolean): void;
    applyMute(): void;
    /** @param {boolean} value */
    setPsgChannelMuted(channel: any, muted: any): void;
    setPsgMuted(value: any): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} value Register/command data value.
     */
    writePsg(value: number): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeY8950(register: number, value: number): void;
    /** @param {Uint8Array} data
     * @param {number} memorySize
     * @param {number} offset */
    loadSampleMemory(data: Uint8Array, offset: number, memorySize: number): void;
    clearSampleMemory(): void;
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
/** @param {Parameters<typeof Y8950AudioEngine.create>[0]} [options] */
export declare const createY8950AudioEngine: (options?: Parameters<typeof Y8950AudioEngine.create>[0]) => Promise<Y8950AudioEngine>;

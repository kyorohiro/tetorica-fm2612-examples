/**
 * @file ymf262audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ymf262 } from './ymf262.js';
import { SegaPSG } from './segapsg.js';
/**
 * Ymf262AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ymf262AudioEngine {
    ymf262: Ymf262;
    psg: SegaPSG | undefined;
    chipRate: number;
    outputRate: number;
    scratchLeft: Float32Array<ArrayBuffer>;
    scratchRight: Float32Array<ArrayBuffer>;
    psgMuted: boolean;
    remainder: number;
    lastLeft: number;
    lastRight: number;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {{ymf262ModuleFactory: import('./soundchip.js').WasmModuleFactory, ymf262ModuleOptions?: import('./soundchip.js').WasmModuleOptions, ymf262Clock?: number, segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory, psgClock?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ymf262AudioEngine>} Initialized engine owned by the caller.
     */
    static create({ ymf262ModuleFactory, ymf262ModuleOptions, ymf262Clock, segaPsgModuleFactory, psgClock, outputSampleRate, masterVolume }?: {
        ymf262ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        ymf262ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ymf262Clock?: number;
        segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        psgClock?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ymf262AudioEngine>;
    /** @param {Ymf262} chip
     * @param {SegaPSG | undefined} psg
     * @param {number} chipRate
     * @param {number} outputRate
     * @param {number} volume */
    constructor(chip: Ymf262, psg: SegaPSG | undefined, chipRate: number, outputRate: number, volume: number);
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
    /** @param {boolean} value */
    setPsgChannelMuted(channel: any, muted: any): void;
    setPsgMuted(value: any): void;
    /**
     * Change one physical channel mute flag.
     * @param {number} channel Zero-based physical channel index, not a MIDI part.
     * @param {boolean} muted True to suppress the channel.
     * @returns {void}
     */
    setChannelMuted(channel: number, muted: boolean): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} value Register/command data value.
     */
    writePsg(value: number): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} port Chip register bank/port (not a MIDI channel).
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeYmf262(port: number, register: number, value: number): void;
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
/** @param {Parameters<typeof Ymf262AudioEngine.create>[0]} [options] */
export declare const createYmf262AudioEngine: (options?: Parameters<typeof Ymf262AudioEngine.create>[0]) => Promise<Ymf262AudioEngine>;

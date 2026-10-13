/**
 * @file ym2151audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2151 } from './ym2151.js';
import { SegaPSG } from './segapsg.js';
import { SegaPcm } from './segapcm.js';
/**
 * Ym2151AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ym2151AudioEngine {
    #private;
    ym2151: Ym2151;
    psg: SegaPSG | undefined;
    segapcm: SegaPcm | undefined;
    chipRate: number;
    outputRate: number;
    psgMuted: boolean;
    segapcmMuted: boolean;
    segapcmChannelMask: number;
    remainder: number;
    lastLeft: number;
    lastRight: number;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {{ym2151ModuleFactory: import('./soundchip.js').WasmModuleFactory, ym2151ModuleOptions?: import('./soundchip.js').WasmModuleOptions, ym2151Clock?: number, ym2151Variant?: 'ym2151'|'ym2164', segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory, psgClock?: number, segaPcmModuleFactory?: import('./soundchip.js').WasmModuleFactory, segaPcmModuleOptions?: import('./soundchip.js').WasmModuleOptions, segaPcmClock?: number, segaPcmBankShift?: number, segaPcmBankMask?: number, outputSampleRate?: number, masterVolume?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2151AudioEngine>} Initialized engine owned by the caller.
     */
    static create({ ym2151ModuleFactory, ym2151ModuleOptions, ym2151Clock, ym2151Variant, segaPsgModuleFactory, psgClock, segaPcmModuleFactory, segaPcmModuleOptions, segaPcmClock, segaPcmBankShift, segaPcmBankMask, outputSampleRate, masterVolume }?: {
        ym2151ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        ym2151ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2151Clock?: number;
        ym2151Variant?: 'ym2151' | 'ym2164';
        segaPsgModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        psgClock?: number;
        segaPcmModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        segaPcmModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        segaPcmClock?: number;
        segaPcmBankShift?: number;
        segaPcmBankMask?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ym2151AudioEngine>;
    /** @param {Ym2151} chip
     * @param {SegaPSG | undefined} psg
     * @param {SegaPcm | undefined} segapcm
     * @param {number} chipRate
     * @param {number} outputRate
     * @param {number} volume */
    constructor(chip: Ym2151, psg: SegaPSG | undefined, segapcm: SegaPcm | undefined, chipRate: number, outputRate: number, volume: number);
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
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeYm2151(register: number, value: number): void;
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
    /** @param {boolean} value */
    setSegaPcmMuted(value: boolean): void;
    /** @param {number} channel
     * @param {boolean} muted */
    setSegaPcmChannelMuted(channel: number, muted: boolean): void;
    applySegaPcmMute(): void;
    /**
     * Reset chip/playback state for a new pass. This is not pause/resume; replay setup writes afterward.
     * @returns {void}
     */
    reset(): void;
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
/** @param {Parameters<typeof Ym2151AudioEngine.create>[0]} [options] */
export declare const createYm2151AudioEngine: (options?: Parameters<typeof Ym2151AudioEngine.create>[0]) => Promise<Ym2151AudioEngine>;

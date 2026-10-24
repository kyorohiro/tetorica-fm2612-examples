/**
 * @file genesisaudioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2612 } from "./ym2612.js";
import { SegaPSG } from "./segapsg.js";
import { Rf5c164 } from "./rf5c164.js";
/**
 * GenesisAudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class GenesisAudioEngine {
    #private;
    ym2612: Ym2612;
    psg: SegaPSG;
    pcm: Rf5c164 | null;
    pwm: any;
    _pcmMuted: boolean;
    _psgMuted: boolean;
    _sampleRate: number;
    _masterVolume: number;
    /** @param {Ym2612} ym2612
     * @param {SegaPSG} psg
     * @param {number} sampleRate
     * @param {number} [masterVolume]
     * @param {Rf5c164 | null} [pcm] */
    constructor(ym2612: Ym2612, psg: SegaPSG, sampleRate: number, masterVolume?: number, pcm?: Rf5c164 | null, pwmOptions?: {});
    /**
     * Create the chip instances required by this engine.
     * @param {{ym2612ModuleFactory: import('./soundchip.js').WasmModuleFactory, ym2612ModuleOptions?: import('./soundchip.js').WasmModuleOptions, segaPsgModuleFactory: import('./soundchip.js').WasmModuleFactory, segaPsgModuleOptions?: import('./soundchip.js').WasmModuleOptions, ym2612Clock?: number, psgClock?: number, masterVolume?: number, rf5c164ModuleFactory?: import('./soundchip.js').WasmModuleFactory, rf5c164ModuleOptions?: import('./soundchip.js').WasmModuleOptions, rf5c164Clock?: number, pwmModel?: "legacy"|"mame", pwmOutputMode?: "dac"|"duty", pwmClock?: number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * Output rate is derived from the YM2612 clock; sampleRate() reports the actual rate.
     * @param {number} [options.ym2612Clock=YM2612_CLOCK] YM2612 input clock in Hz.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<GenesisAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        ym2612ModuleFactory: import('./soundchip.js').WasmModuleFactory;
        ym2612ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        segaPsgModuleFactory: import('./soundchip.js').WasmModuleFactory;
        segaPsgModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2612Clock?: number;
        psgClock?: number;
        masterVolume?: number;
        rf5c164ModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        rf5c164ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        rf5c164Clock?: number;
        pwmModel?: "legacy" | "mame";
        pwmOutputMode?: "dac" | "duty";
        pwmClock?: number;
    }): Promise<GenesisAudioEngine>;
    /**
     * Release the underlying chips and their resources. Do not render after disposal.
     * @returns {void}
     */
    dispose(): void;
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
    writeYm2612(port: number, register: number, value: number): void;
    /** @param {boolean} muted */
    setPsgChannelMuted(channel: any, muted: boolean): void;
    setPsgMuted(muted: any): void;
    /** @param {boolean} muted */
    setPcmMuted(muted: boolean): void;
    clearRf5c164Memory(): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeRf5c164(register: number, value: number): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} offset Chip address offset.
     * @param {number} value Register/command data value.
     */
    writeRf5c164Memory(offset: number, value: number): void;
    /** @param {Uint8Array} data
     * @param {number} offset */
    loadRf5c164Memory(data: Uint8Array, offset: number): void;
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
    writePwm(register: number, value: number): void;
    /** @param {boolean} muted */
    setPwmMuted(muted: boolean): void;
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
/** Original, approximate VGM PWM renderer; no FIFO or hardware timer emulation.
 * Writes are timed by VgmPlayer. Hold each value until the next write.
 */
export declare class SimplePwm {
    muted: boolean;
    cycle: number | undefined;
    control: number | undefined;
    left: number | null | undefined;
    right: number | null | undefined;
    constructor();
    /** @returns {Readonly<{byteLength:number}>} Opaque snapshot owned by this instance. */
    saveState(): Readonly<{
        byteLength: number;
    }>;
    /** @param {Readonly<{byteLength:number}>} state Snapshot returned by this instance. */
    loadState(state: Readonly<{
        byteLength: number;
    }>): void;
    reset(): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeRegister(register: number, value: number): void;
    output(): number[];
}
/** @param {Parameters<typeof GenesisAudioEngine.create>[0]} [options] */
export declare function createGenesisAudioEngine(options?: Parameters<typeof GenesisAudioEngine.create>[0]): Promise<GenesisAudioEngine>;

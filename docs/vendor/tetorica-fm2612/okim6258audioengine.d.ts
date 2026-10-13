/**
 * @file okim6258audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
/**
 * Require a single OKIM6258 using 4-bit ADPCM.
 * @param {{okim6258Clock: number, okim6258Flags: number}} header VGM clock and format flags.
 * @returns {void}
 * @throws {Error} For dual/variant chips or 3-bit ADPCM.
 */
export declare function validateOki6258Header(header: {
    okim6258Clock: number;
    okim6258Flags: number;
}): void;
/**
 * Oki6258AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Oki6258AudioEngine {
    #private;
    module: import("./soundchip.js").WasmChipModule;
    rate: number;
    volume: number;
    ptr: number;
    capacity: number;
    muted: boolean;
    handle: any;
    /**
     * Create the chip instances required by this engine.
     * @param {{moduleFactory: import('./soundchip.js').WasmModuleFactory, clock: number, flags?: number, outputSampleRate?: number, masterVolume?: number}} options Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Oki6258AudioEngine>} Initialized engine owned by the caller.
     */
    static create({ moduleFactory, clock, flags, outputSampleRate, masterVolume }: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        clock: number;
        flags?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Oki6258AudioEngine>;
    /** @param {import('./soundchip.js').WasmChipModule} module
     * @param {number} clock
     * @param {number} flags
     * @param {number} rate
     * @param {number} volume */
    constructor(module: import('./soundchip.js').WasmChipModule, clock: number, flags: number, rate: number, volume: number);
    /**
     * Return the rate used by process() and processFrames().
     * @returns {number} Output stereo frames per second (Hz).
     */
    sampleRate(): number;
    /**
     * Set the linear master gain; validation/clamping follows this engine.
     * @param {number} v Gain multiplier, not dB.
     */
    setMasterVolume(v: number): void;
    /**
     * Read the current linear master gain.
     * @returns {number} Gain multiplier, not a dB value.
     */
    getMasterVolume(): number;
    /** @param {boolean} v */
    setOkiMuted(v: boolean): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} r Register address.
     * @param {number} v Register data value.
     */
    writeOki6258(r: number, v: number): void;
    /**
     * Reset chip/playback state for a new pass. This is not pause/resume; replay setup writes afterward.
     * @returns {void}
     */
    reset(): void;
    stateSettingsKey(): string;
    supportsState(): boolean;
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
     * Allocate stereo output and advance synthesis.
     * @param {number} frames Nonnegative integer frame count at sampleRate().
     * @returns {{left:Float32Array,right:Float32Array}} Rendered stereo output.
     */
    processFrames(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
}
/**
 * Add OKIM6258 rendering and controls to an existing engine in place.
 * The combined reset/dispose also reset/dispose the attached ADPCM engine.
 * @template {{processFrames: (frames: number) => {left: Float32Array, right: Float32Array}, reset: () => void, dispose: () => void, getMasterVolume: () => number}} Engine
 * @param {Engine} engine Primary engine whose master volume also scales ADPCM.
 * @param {Oki6258AudioEngine} oki ADPCM engine advanced over the same output frames.
 * @returns {Engine & {attachedOki6258: Oki6258AudioEngine, writeOki6258: (register: number, value: number) => void, setOkiMuted: (muted: boolean) => void}} The mutated primary engine.
 */
export declare function attachOki6258<Engine extends {
    processFrames: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    reset: () => void;
    dispose: () => void;
    getMasterVolume: () => number;
}>(engine: Engine, oki: Oki6258AudioEngine): Engine & {
    attachedOki6258: Oki6258AudioEngine;
    writeOki6258: (register: number, value: number) => void;
    setOkiMuted: (muted: boolean) => void;
};

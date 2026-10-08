/**
 * @file okim6258audioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
export declare function validateOki6258Header(header: any): void;
/**
 * Oki6258AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Oki6258AudioEngine {
    #private;
    module: any;
    rate: any;
    volume: any;
    ptr: number;
    capacity: number;
    muted: boolean;
    handle: any;
    /**
     * Create the chip instances required by this engine.
     * @param {Object} options Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Oki6258AudioEngine>} Initialized engine owned by the caller.
     */
    /** @param {{moduleFactory: Function, clock: number, flags?: number, outputSampleRate?: number, masterVolume?: number}} options */
    static create({ moduleFactory, clock, flags, outputSampleRate, masterVolume }: {
        moduleFactory: Function;
        clock: number;
        flags?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Oki6258AudioEngine>;
    constructor(module: any, clock: any, flags: any, rate: any, volume: any);
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
    setOkiMuted(v: any): void;
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
    saveState(): Readonly<{
        byteLength: any;
        key: string;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
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
export declare function attachOki6258(engine: any, oki: any): any;

/**
 * Ym2203AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ym2203AudioEngine {
    #private;
    ym2203: any;
    _chipSampleRate: any;
    _sampleRate: any;
    _masterVolume: number;
    _sourceMuteMask: number;
    channelMuteMask: number;
    _resampleRemainder: number;
    _lastLeft: number;
    _lastRight: number;
    constructor(ym2203: any, chipSampleRate: any, outputSampleRate: any, masterVolume?: number);
    /**
     * Create the chip instances required by this engine.
     * @param {Object} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2203AudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ym2203AudioEngine>;
    supportsState(): boolean;
    stateSettingsKey(): string;
    saveState(): Readonly<{
        byteLength: any;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
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
    setSsgMuted(muted: any): void;
    setSourceMuted(bit: any, muted: any): void;
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
export declare function createYm2203AudioEngine(options: any): Promise<Ym2203AudioEngine>;

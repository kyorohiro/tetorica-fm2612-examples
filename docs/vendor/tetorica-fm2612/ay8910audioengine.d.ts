/**
 * Ay8910AudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class Ay8910AudioEngine {
    ay8910: any;
    channelMask: number;
    muted: boolean;
    volume: number | undefined;
    /**
     * Create the chip instances required by this engine.
     * @param {Object} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ay8910AudioEngine>} Initialized engine owned by the caller.
     */
    /** @param {{moduleFactory: Function, moduleOptions?: Record<string, unknown>, clock: number, type?: number, flags?: number, outputSampleRate?: number, masterVolume?: number}} options */
    static create({ moduleFactory, moduleOptions, clock, type, flags, outputSampleRate, masterVolume }?: {
        moduleFactory: Function;
        moduleOptions?: Record<string, unknown>;
        clock: number;
        type?: number;
        flags?: number;
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ay8910AudioEngine>;
    constructor(chip: any, volume?: number);
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
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeAy8910(register: number, value: number): void;
    setAyMuted(muted: any): void;
    setAyChannelMuted(channel: any, muted: any): void;
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
export declare const createAy8910AudioEngine: (options: any) => Promise<Ay8910AudioEngine>;
export declare function validateAyPlaybackHeader(header: any): void;

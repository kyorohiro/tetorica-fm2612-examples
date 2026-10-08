/** YM2610 / YM2610B FM, SSG and ADPCM playback engine. */
export declare class Ym2610BAudioEngine {
    #private;
    chip: any;
    chipSampleRate: any;
    outputSampleRate: any;
    masterVolume: number;
    remainder: number;
    lastLeft: number;
    lastRight: number;
    sourceMuteMask: number;
    constructor(chip: any, chipSampleRate: any, outputSampleRate: any, masterVolume?: number);
    /**
     * Create the chip instances required by this engine.
     * @param {Object} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<Ym2610BAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<Ym2610BAudioEngine>;
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
     * @param {number} value Gain multiplier, not dB.
     */
    setMasterVolume(value: number): number;
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
    writeYm2610B(port: number, register: number, value: number): void;
    loadAdpcmRom(type: any, data: any, offset: any, size: any): void;
    clearAdpcmRoms(): void;
    setSsgMuted(muted: any): void;
    setRhythmMuted(muted: any): void;
    setAdpcmBMuted(muted: any): void;
    setSourceMuted(bit: any, muted: any): void;
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
export declare function createYm2610BAudioEngine(options: any): Promise<Ym2610BAudioEngine>;

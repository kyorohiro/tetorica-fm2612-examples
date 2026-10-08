import { PWM32X } from './pwm32x.js';
/**
 * GenesisAudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class GenesisAudioEngine {
    #private;
    ym2612: any;
    psg: any;
    pcm: any;
    pwm: PWM32X | SimplePwm;
    _pcmMuted: boolean;
    _psgMuted: boolean;
    _sampleRate: any;
    _masterVolume: number;
    constructor(ym2612: any, psg: any, sampleRate: any, masterVolume?: number, pcm?: null, pwmOptions?: {});
    /**
     * Create the chip instances required by this engine.
     * @param {Object} [options={}] Chip factories, clocks in Hz and loader settings.
     * Output rate is derived from the YM2612 clock; sampleRate() reports the actual rate.
     * @param {number} [options.ym2612Clock=YM2612_CLOCK] YM2612 input clock in Hz.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<GenesisAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        ym2612Clock?: number;
        masterVolume?: number;
    }): Promise<GenesisAudioEngine>;
    /**
     * Release the underlying chips and their resources. Do not render after disposal.
     * @returns {void}
     */
    dispose(): void;
    supportsState(): any;
    stateSettingsKey(): string;
    saveState(): Readonly<{
        byteLength: any;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
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
    setPsgMuted(muted: any): void;
    setPcmMuted(muted: any): void;
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
    loadRf5c164Memory(data: any, offset: any): void;
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
    setPwmMuted(muted: any): void;
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
    saveState(): Readonly<{
        cycle: number | undefined;
        control: number | undefined;
        left: number | null | undefined;
        right: number | null | undefined;
    }>;
    loadState(state: any): void;
    reset(): void;
    /**
     * Dispatch a VGM register/command write to the corresponding sound chip.
     * @param {number} register Register address within the selected chip bank.
     * @param {number} value Register/command data value.
     */
    writeRegister(register: number, value: number): void;
    output(): number[];
}
export declare function createGenesisAudioEngine(options: any): Promise<GenesisAudioEngine>;

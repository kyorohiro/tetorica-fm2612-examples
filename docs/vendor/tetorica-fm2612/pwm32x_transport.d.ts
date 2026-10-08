import { PWM32X } from './pwm32x.js';
import { PWM32XPlayback } from './pwm32x_playback.js';
/** Main-side command API; chip rendering and the schedule live in AudioWorklet. */
export declare class PWM32XWorkletTransport {
    chip: import("./soundchip_worklet.js").WorkletSoundChip;
    /** @param {import("./soundchip_worklet.js").WorkletSoundChip} chip */
    constructor(chip: import("./soundchip_worklet.js").WorkletSoundChip);
    /** @param {number} register @param {number} value @returns {Promise<void>} */
    write(register: number, value: number): Promise<void>;
    /** @param {number} register @param {number} value @returns {Promise<void>} */
    writeRegister(register: number, value: number): Promise<void>;
    /** @param {number} register @returns {Promise<number>} */
    read(register: number): Promise<number>;
    /** @returns {Promise<void>} */
    reset(): Promise<void>;
    /** @param {import('./pwm32x_playback.js').PWMWrite[]} entries @returns {Promise<number>} */
    scheduleWrites(entries: import('./pwm32x_playback.js').PWMWrite[]): Promise<number>;
    /** @returns {Promise<void>} */
    clearSchedule(): Promise<void>;
    /** @returns {Promise<ReturnType<PWM32XPlayback['getState']>>} */
    getState(): Promise<ReturnType<PWM32XPlayback['getState']>>;
    start(): Promise<void>;
    stop(): Promise<void>;
    flush(): Promise<unknown>;
    close(): Promise<void>;
}
/** Explicit PCM rendering for WAV export or a consumer-owned output. */
export declare class PWM32XDirectTransport {
    chip: PWM32XPlayback;
    /** @param {PWM32X | PWM32XPlayback} chip */
    constructor(chip: PWM32X | PWM32XPlayback);
    /** @param {number} register @param {number} value */
    write(register: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} register */
    read(register: number): number | undefined;
    reset(): void;
    /** @param {import('./pwm32x_playback.js').PWMWrite[]} entries */
    scheduleWrites(entries: import('./pwm32x_playback.js').PWMWrite[]): number;
    clearSchedule(): void;
    getState(): {
        model: 'mame';
        outputMode: "dac" | "duty";
        clock: number;
        sampleRate: number;
        currentFrame: number;
        queuedWrites: number;
    };
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
        sampleRate: number;
    };
}

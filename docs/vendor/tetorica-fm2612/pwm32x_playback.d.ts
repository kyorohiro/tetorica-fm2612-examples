import { PWM32X } from './pwm32x.js';
export type PWMWrite = {
    frame: number;
    register: 0 | 1 | 2 | 3 | 4;
    value: number;
};
export type PWMAPI = Pick<PWM32XPlayback, 'write' | 'writeRegister' | 'read' | 'reset' | 'scheduleWrites' | 'clearSchedule' | 'getState'>;
export type AsyncPWMAPI = {
    [K in keyof PWMAPI]: (...args: Parameters<PWMAPI[K]>) => Promise<ReturnType<PWMAPI[K]>>;
};
/** @typedef {{frame: number, register: 0|1|2|3|4, value: number}} PWMWrite */
/** @typedef {Pick<PWM32XPlayback, 'write'|'writeRegister'|'read'|'reset'|'scheduleWrites'|'clearSchedule'|'getState'>} PWMAPI */
/** @typedef {{[K in keyof PWMAPI]: (...args: Parameters<PWMAPI[K]>) => Promise<ReturnType<PWMAPI[K]>>}} AsyncPWMAPI */
/** MAME-derived PWM plus output-frame scheduling; no timers or audio device. */
export declare class PWM32XPlayback {
    chip: PWM32X;
    frame: number;
    queue: any[];
    order: number;
    /** @param {import("./pwm32x.js").PWM32XOptions} [options] @param {PWM32X} [chip] */
    constructor(options?: import("./pwm32x.js").PWM32XOptions, chip?: PWM32X);
    sampleRate(): number;
    /** @param {number} register @param {number} value */
    write(register: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} register */
    read(register: number): number | undefined;
    reset(): void;
    /** Entries are relative to the next output frame when this command is received. */
    /** @param {PWMWrite[]} entries */
    scheduleWrites(entries: PWMWrite[]): number;
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
    dispose(): void;
}
export declare const PWM_METHODS: Set<string>;
/** Main or logic Worker client; PCM and scheduling stay in the AudioWorklet. */
/** @param {MessagePort} port @returns {AsyncPWMAPI & {dispose(): void}} */
export declare function createPWM32XClient(port: MessagePort): AsyncPWMAPI & {
    dispose(): void;
};

import { PWM32X } from './pwm32x.js';
import { PWM32XWasm } from './pwm32x_wasm.js';
export type PWMWrite = {
    frame: number;
    register: 0 | 1 | 2 | 3 | 4;
    value: number;
};
export type PWMAPI = Pick<PWM32XPlayback, 'write' | 'writeRegister' | 'read' | 'reset' | 'scheduleWrites' | 'clearSchedule' | 'getState' | 'setClock'>;
export type AsyncPWMAPI = {
    [K in keyof PWMAPI]: (...args: Parameters<PWMAPI[K]>) => Promise<ReturnType<PWMAPI[K]>>;
};
/** @typedef {{frame: number, register: 0|1|2|3|4, value: number}} PWMWrite */
/** @typedef {Pick<PWM32XPlayback, 'write'|'writeRegister'|'read'|'reset'|'scheduleWrites'|'clearSchedule'|'getState'|'setClock'>} PWMAPI */
/** @typedef {{[K in keyof PWMAPI]: (...args: Parameters<PWMAPI[K]>) => Promise<ReturnType<PWMAPI[K]>>}} AsyncPWMAPI */
/** MAME-derived PWM plus output-frame scheduling; no timers or audio device. */
export declare class PWM32XPlayback {
    chip: PWM32X | PWM32XWasm;
    frame: number;
    queue: any[];
    order: number;
    capacity: number;
    views: Map<any, any>;
    scratchLeft: Float32Array<ArrayBuffer> | null | undefined;
    scratchRight: Float32Array<ArrayBuffer> | null | undefined;
    /** @param {import('./pwm32x.js').PWM32XOptions} [options] */
    static create(options?: import('./pwm32x.js').PWM32XOptions): Promise<PWM32XPlayback>;
    /** The synchronous constructor retains the JS reference unless a chip is supplied.
     * @param {import("./pwm32x.js").PWM32XOptions} [options] @param {PWM32X|import('./pwm32x_wasm.js').PWM32XWasm} [chip] */
    constructor(options?: import("./pwm32x.js").PWM32XOptions, chip?: PWM32X | import('./pwm32x_wasm.js').PWM32XWasm);
    get backend(): string;
    /** Change master Hz without resetting FIFO, phase or output-frame reservations. @param {number} hz */
    setClock(hz: number): void;
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
        backend: string;
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
    reserveStereoFrames(frames: any): void;
    pcmView(frames: any): any;
    /** Scratch views are reused across render calls. */
    generateStereoView(frames: any): any;
    /** Render a scheduled span without allocating PCM arrays in the AudioWorklet. */
    renderInto(left: any, right: any, outputOffset?: number, frames?: number): void;
    dispose(): void;
}
export declare const PWM_METHODS: Set<string>;
/** Main or logic Worker client; PCM and scheduling stay in the AudioWorklet. */
/** @param {MessagePort} port @param {{native?:boolean}} [options] @returns {AsyncPWMAPI & {dispose(): void,stopVoices?:()=>Promise<void>}} */
export declare function createPWM32XClient(port: MessagePort, options?: {
    native?: boolean;
}, lifecycle?: {}): AsyncPWMAPI & {
    dispose(): void;
    stopVoices?: () => Promise<void>;
};

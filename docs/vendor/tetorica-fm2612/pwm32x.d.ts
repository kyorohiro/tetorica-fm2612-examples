export type PWM32XOptions = {
    clock?: number;
    sampleRate?: number;
    gain?: number;
    outputMode?: 'dac' | 'duty';
    implementation?: 'wasm' | 'js';
    moduleFactory?: import('./soundchip.js').WasmModuleFactory;
    moduleOptions?: import('./soundchip.js').WasmModuleOptions;
    assetBaseUrl?: string | URL;
    signal?: AbortSignal;
};
/** @typedef {{clock?: number, sampleRate?: number, gain?: number, outputMode?: 'dac'|'duty', implementation?: 'wasm'|'js', moduleFactory?: import('./soundchip.js').WasmModuleFactory, moduleOptions?: import('./soundchip.js').WasmModuleOptions, assetBaseUrl?: string|URL, signal?: AbortSignal}} PWM32XOptions */
export declare const PWM32X_CLOCK = 23011361;
export declare class PWM32X {
    #private;
    backend: string;
    clock: number;
    rate: number;
    gain: number;
    outputMode: "dac" | "duty";
    muted: boolean;
    closed: boolean;
    control: number | undefined;
    cycle: number | undefined;
    cycleRegister: number | undefined;
    leftFifo: any[] | undefined;
    rightFifo: any[] | undefined;
    left: any;
    right: any;
    timerTick: number | undefined;
    interruptCount: number | undefined;
    untilTick: number | undefined;
    /** Shared C++ core by default. `new PWM32X()` remains the synchronous JS reference.
     * A WASM load failure is reported; JS must be selected explicitly.
     * @param {PWM32XOptions} [options] */
    static create(options?: PWM32XOptions): Promise<PWM32X | import("./pwm32x_wasm.js").PWM32XWasm>;
    /** @param {PWM32XOptions} [options] */
    constructor({ clock, sampleRate, gain, outputMode }?: PWM32XOptions);
    sampleRate(): number;
    assertOpen(): void;
    reset(): void;
    active(): boolean;
    configureTimer(): void;
    /** @param {number} register @param {number} value */
    write(register: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} register */
    read(register: number): number | undefined;
    tick(): void;
    output(): number[];
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
    };
    supportsState(): boolean;
    saveState(): Readonly<{
        byteLength: 128;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
    dispose(): void;
}

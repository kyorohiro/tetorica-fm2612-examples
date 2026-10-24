export declare class PWM32XWasm {
    #private;
    /** @type {'wasm'} */ backend: 'wasm';
    module: any;
    handle: any;
    api: any;
    /** @type {number} */ stateSize: number;
    statePtr: number;
    fifoPtr: number;
    ptr: number;
    capacity: number;
    buffer: any;
    views: Map<any, any>;
    closed: boolean;
    leftFifoView: number[];
    rightFifoView: number[];
    /** @param {import('./pwm32x.js').PWM32XOptions} [options] */
    static create(options?: import('./pwm32x.js').PWM32XOptions): Promise<PWM32XWasm>;
    constructor(module: any, handle: any, api: any, stateSize: any);
    assertOpen(): void;
    /** @returns {number} */
    getField(field: any): number;
    setField(field: any, value: any): void;
    get clock(): number;
    set clock(value: number);
    get rate(): number;
    set rate(value: number);
    get gain(): number;
    set gain(value: number);
    /** @returns {'dac'|'duty'} */
    get outputMode(): 'dac' | 'duty';
    set outputMode(value: 'dac' | 'duty');
    get muted(): boolean;
    set muted(value: boolean);
    get control(): number;
    set control(value: number);
    get cycle(): number;
    set cycle(value: number);
    get cycleRegister(): number;
    set cycleRegister(value: number);
    /** @returns {number|null} */
    get left(): number | null;
    set left(value: number | null);
    /** @returns {number|null} */
    get right(): number | null;
    set right(value: number | null);
    get timerTick(): number;
    set timerTick(value: number);
    get interruptCount(): number;
    set interruptCount(value: number);
    get untilTick(): number;
    set untilTick(value: number);
    sampleRate(): number;
    reset(): void;
    active(): boolean;
    configureTimer(): void;
    tick(): void;
    /** @param {number} register @param {number} value */
    write(register: number, value: number): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} register @returns {number} */
    read(register: number): number;
    output(): number[];
    /** @param {number} side @returns {number[]} */
    fifo(side: number): number[];
    /** @param {number} side @returns {number[]} */
    liveFifo(side: number): number[];
    /** @param {number} side @param {number[]} values */
    setFifo(side: number, values: number[]): void;
    get leftFifo(): number[];
    set leftFifo(values: number[]);
    get rightFifo(): number[];
    set rightFifo(values: number[]);
    refreshViews(): void;
    /** @param {number} frames @returns {{left:Float32Array,right:Float32Array}} */
    pcmView(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    /** @param {number} frames */
    reserveStereoFrames(frames: number): void;
    /** Scratch views remain valid until generation, growth or disposal.
     * @param {number} frames @returns {{left:Float32Array,right:Float32Array}} */
    generateStereoView(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
    };
    /** Fill an output span using the preallocated WASM scratch buffer.
     * @param {Float32Array} left @param {Float32Array} right @param {number} [offset] @param {number} [frames] */
    renderInto(left: Float32Array, right: Float32Array, offset?: number, frames?: number): void;
    supportsState(): boolean;
    /** @returns {Readonly<{byteLength:number}>} */
    saveState(): Readonly<{
        byteLength: number;
    }>;
    /** @param {Readonly<{byteLength:number}>} state */
    validateState(state: Readonly<{
        byteLength: number;
    }>): void;
    /** @param {Readonly<{byteLength:number}>} state */
    loadState(state: Readonly<{
        byteLength: number;
    }>): void;
    dispose(): void;
}

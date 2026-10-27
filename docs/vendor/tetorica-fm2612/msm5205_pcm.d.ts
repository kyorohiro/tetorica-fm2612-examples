export declare const MSM5205_PCM_MAX_BYTES = 65536;
export declare const MSM5205_PCM_DEFAULT_CLOCK = 1536000;
/** Create a standalone mono ADPCM renderer. No AudioContext is required.
 * @param {{sampleRate?:number,clock?:number,wasmBinary?:ArrayBuffer|Uint8Array,
 * wasmBytes?:ArrayBuffer|Uint8Array,wasmURL?:string|URL}} [options]
 */
export declare function createMSM5205PCM({ sampleRate, clock, wasmBinary, wasmBytes, wasmURL }?: {
    sampleRate?: number;
    clock?: number;
    wasmBinary?: ArrayBuffer | Uint8Array;
    wasmBytes?: ArrayBuffer | Uint8Array;
    wasmURL?: string | URL;
}): Promise<{
    sampleRate: number;
    clock: number;
    /** Attach nonempty packed ADPCM; a fixed 64 KiB WASM RAM receives one copy.
     * Caller bytes are not retained. Render never allocates or grows memory.
     * @param {Uint8Array} bytes
     */
    prepare(bytes: Uint8Array): void;
    /** Offset and length use NIBBLES, high nibble first, not bytes.
     * @param {{offset?:number,length?:number,loop?:boolean,rate?:number}} [options]
     */
    play({ offset, length, loop, rate }?: {
        offset?: number;
        length?: number;
        loop?: boolean;
        rate?: number;
    }): void;
    stop(): void;
    reset(): void;
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} gain */
    setGain(gain: number): void;
    /** @param {boolean} muted */
    setMuted(muted: boolean): void;
    readState: () => {
        mode: string;
        state: string;
        sourceBytes: any;
        offset: any;
        length: any;
        positionNibbles: any;
        cursor: any;
        loop: boolean;
        rate: any;
        phase: any;
        outputFrames: any;
        gain: any;
        muted: boolean;
        signal: any;
        step: any;
        resetLine: any;
        vclk: any;
        prescaler: any;
        bits: any;
        fifoCount: any;
        fifoLength: any;
        sampleRate: number;
        clock: number;
        effectiveSampleRate: number;
    };
    status: () => {
        mode: string;
        state: string;
        sourceBytes: any;
        offset: any;
        length: any;
        positionNibbles: any;
        cursor: any;
        loop: boolean;
        rate: any;
        phase: any;
        outputFrames: any;
        gain: any;
        muted: boolean;
        signal: any;
        step: any;
        resetLine: any;
        vclk: any;
        prescaler: any;
        bits: any;
        fifoCount: any;
        fifoLength: any;
        sampleRate: number;
        clock: number;
        effectiveSampleRate: number;
    };
    dispose(): void;
    /** @param {Float32Array} left @param {Float32Array} right @param {number} [frames] */
    render(left: Float32Array, right: Float32Array, frames?: number): void;
}>;

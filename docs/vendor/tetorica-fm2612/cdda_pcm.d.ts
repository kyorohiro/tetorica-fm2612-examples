export declare const CDDA_PCM_RATE = 44100;
export declare const CDDA_PCM_MAX_BYTES: number;
export type CddaPCMOptions = {
    sampleRate?: number;
    wasmBytes?: ArrayBuffer | Uint8Array;
    wasmBinary?: ArrayBuffer | Uint8Array;
    wasmURL?: string | URL;
};
/** @typedef {{sampleRate?:number, wasmBytes?:ArrayBuffer|Uint8Array,
 * wasmBinary?:ArrayBuffer|Uint8Array, wasmURL?:string|URL}} CddaPCMOptions */
/** Create one fixed-memory PCM16 renderer. wasmBinary/wasmBytes contain the
 * compiled .wasm bytes, not an already instantiated WebAssembly.Module.
 * @param {CddaPCMOptions} [options]
 */
export declare function createCDDAPCM({ sampleRate, wasmBytes, wasmBinary, wasmURL }?: CddaPCMOptions): Promise<{
    sampleRate: number;
    /** @param {Uint8Array} bytes */
    prepare(bytes: Uint8Array): void;
    play(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    /** @param {number} frame */
    seek(frame: number): void;
    /** @param {number} gain */
    setGain(gain: number): void;
    /** @param {boolean} muted */
    setMuted(muted: boolean): void;
    status(): {
        state: string;
        frame: any;
        positionFrames: any;
        durationFrames: number;
        phase: any;
        frames: number;
        sampleRate: number;
        sourceRate: number;
        outputFrames: any;
        gain: any;
        muted: boolean;
    };
    dispose(): void;
    /** @param {Float32Array} left @param {Float32Array} right @param {number} [frames] */
    render(left: Float32Array, right: Float32Array, frames?: number): void;
}>;

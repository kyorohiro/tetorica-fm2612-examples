import { createY8950AdpcmPreview } from './y8950_adpcm_preview.js';
export type Y8950AdpcmDecoder = (bytes: ArrayBuffer) => Promise<AudioBuffer | import('./wav.js').ChannelPCM>;
export type Y8950AdpcmPreview = NonNullable<ReturnType<typeof createY8950AdpcmPreview>> & {
    revision?: number;
};
export type Y8950AdpcmLifecycle<Scope = unknown> = {
    captureContext?: () => Scope;
    checkCurrent?: (scope?: Scope) => void;
    withContext?: (scope: Scope, callback: () => unknown) => unknown;
    decodeAudio?: Y8950AdpcmDecoder;
};
export type Y8950AdpcmTransport<Scope = unknown> = Y8950AdpcmLifecycle<Scope> & {
    loadMemory?: (bytes: Uint8Array, address: number, scope?: Scope, preview?: Y8950AdpcmPreview | null) => unknown;
    clearMemory?: (scope?: Scope) => unknown;
};
export type Y8950AdpcmSampleOptions = {
    address?: number;
    sampleRate?: number;
    signal?: AbortSignal;
    decodeAudio?: Y8950AdpcmDecoder;
};
/** @typedef {(bytes:ArrayBuffer)=>Promise<AudioBuffer|import('./wav.js').ChannelPCM>} Y8950AdpcmDecoder */
/** @typedef {NonNullable<ReturnType<typeof createY8950AdpcmPreview>> & {revision?:number}} Y8950AdpcmPreview */
/** @template [Scope=unknown]
 * @typedef {{captureContext?:()=>Scope,checkCurrent?:(scope?:Scope)=>void,
 * withContext?:(scope:Scope,callback:()=>unknown)=>unknown,decodeAudio?:Y8950AdpcmDecoder}} Y8950AdpcmLifecycle */
/** @template [Scope=unknown]
 * @typedef {Y8950AdpcmLifecycle<Scope> & {
 * loadMemory?:(bytes:Uint8Array,address:number,scope?:Scope,preview?:Y8950AdpcmPreview|null)=>unknown,
 * clearMemory?:(scope?:Scope)=>unknown}} Y8950AdpcmTransport */
/** @typedef {{address?:number,sampleRate?:number,signal?:AbortSignal,decodeAudio?:Y8950AdpcmDecoder}} Y8950AdpcmSampleOptions */
export declare const Y8950_ADPCM_MEMORY_BYTES = 2097152;
/** Snapshot encoded bytes before an asynchronous upload. Addresses are bytes. */
export declare function copyY8950AdpcmMemory(bytes: any, address?: number): Uint8Array<ArrayBuffer>;
/** One mono ADPCM-B voice on a Y8950. The parent owns the register image, clock
 * and lifecycle. Native/Worker transports may bind an asynchronous operation to
 * its original owner with captureContext/checkCurrent/withContext. RAM uploads
 * atomically stop only ADPCM on apply. They are acknowledged before loadSample
 * writes its new range; no playback starts. Raw Y8950 memory access is separate.
 * @template [Scope=unknown]
 * @param {import('./opl_synth.js').OPLSynth} client
 * @param {Y8950AdpcmTransport<Scope>} [transport]
 */
export declare function attachY8950Adpcm<Scope = unknown>(client: import('./opl_synth.js').OPLSynth, { loadMemory, clearMemory, captureContext, checkCurrent, withContext, decodeAudio }?: Y8950AdpcmTransport<Scope>): {
    loadMemory(bytes: any, address?: number): Promise<void>;
    clearMemory(): Promise<void>;
    /** @param {unknown} source @param {Y8950AdpcmSampleOptions} [options] */
    loadSample(source: unknown, options?: Y8950AdpcmSampleOptions): Promise<{
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        sampleRate: number;
        deltaN: number;
        duration: number;
    }>;
    setSample({ start, end }: {
        end: any;
        start: any;
    }): void;
    setDeltaN(value: any): void;
    setPlaybackRate(rate: any): number;
    setVolume(value: any): void;
    keyOn({ repeat }?: {
        repeat?: boolean | undefined;
    }): void;
    keyOff(): void;
    reset(): void;
};

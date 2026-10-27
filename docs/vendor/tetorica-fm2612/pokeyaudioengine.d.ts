import { Pokey } from './pokey.js';
export type PokeyAudioEngineOptions = {
    moduleFactory?: Function;
    moduleOptions?: object;
    clock?: number;
    outputSampleRate?: number;
    masterVolume?: number;
};
/** Speaker-only boundary for the unipolar legacy POKEY DAC. A 10 Hz DC blocker
 * removes its variable offset (including clipped multi-channel mixes) without
 * output normalization. Raw Pokey.generateStereo() remains unchanged.
 */
/** @typedef {{moduleFactory?:Function,moduleOptions?:object,clock?:number,outputSampleRate?:number,masterVolume?:number}} PokeyAudioEngineOptions */
export declare class PokeyAudioEngine {
    chip: Pokey;
    rate: number;
    registers: Uint8Array<ArrayBuffer>;
    mutedChannels: Uint8Array<ArrayBuffer>;
    coefficient: number;
    previousInput: number;
    previousOutput: number;
    volume: any;
    /** @param {PokeyAudioEngineOptions} [options] @returns {Promise<PokeyAudioEngine>} */
    static create({ moduleFactory, moduleOptions, clock, outputSampleRate, masterVolume }?: PokeyAudioEngineOptions): Promise<PokeyAudioEngine>;
    /** @param {Pokey} chip @param {number} [volume=1] */
    constructor(chip: Pokey, volume?: number);
    alive(): void;
    sampleRate(): number;
    getState(): {
        clock: number;
        registers: number[];
        mutedChannels: number[];
    };
    setMasterVolume(volume: any): void;
    getMasterVolume(): any;
    writeRegister(register: any, value: any): void;
    readRegister(register: any): number;
    writePokey(register: any, value: any): void;
    setChannelMuted(channel: any, muted: any): void;
    reset(): void;
    /** Borrowed buffers, reused with no render-time allocation. */
    /** @param {number} frames @returns {Readonly<{left:Float32Array,right:Float32Array}>} */
    generateStereoView(frames: number): Readonly<{
        left: Float32Array;
        right: Float32Array;
    }>;
    processFrames(frames: any): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
    };
    process(left: any, right: any, frames?: any): void;
    dispose(): void;
}
export declare const createPokeyAudioEngine: (options: any) => Promise<PokeyAudioEngine>;

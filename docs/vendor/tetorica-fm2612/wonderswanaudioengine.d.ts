export type WonderSwanAudioEngineOptions = {
    moduleFactory?: import('./soundchip.js').WasmModuleFactory;
    moduleOptions?: object;
    clock?: number;
    outputSampleRate?: number;
    masterVolume?: number;
};
/** @typedef {{moduleFactory?: import('./soundchip.js').WasmModuleFactory,
 * moduleOptions?: object, clock?: number, outputSampleRate?: number,
 * masterVolume?: number}} WonderSwanAudioEngineOptions */
export declare class WonderSwanAudioEngine {
    chip: any;
    rate: any;
    engineRate: number;
    registers: Uint8Array<ArrayBuffer>;
    memory: Uint8Array<ArrayBuffer>;
    mutedChannels: Uint8Array<ArrayBuffer>;
    targetLeft: Float64Array<ArrayBuffer>;
    targetRight: Float64Array<ArrayBuffer>;
    heldLeft: Float64Array<ArrayBuffer>;
    heldRight: Float64Array<ArrayBuffer>;
    waveReady: Uint8Array<ArrayBuffer>;
    coldWavePosition: Uint16Array<ArrayBuffer>;
    speakerPhase: number;
    volume: number | undefined;
    /** @param {WonderSwanAudioEngineOptions} [options] */
    static create({ moduleFactory, moduleOptions, clock, outputSampleRate, masterVolume }?: WonderSwanAudioEngineOptions): Promise<WonderSwanAudioEngine>;
    constructor(chip: any, volume?: number);
    alive(): void;
    sampleRate(): any;
    setMasterVolume(value: any): number;
    getMasterVolume(): number | undefined;
    supportsState(): boolean;
    /** VGM 0xBC / DAC-stream register numbers are relative to I/O 0x80. */
    writeWonderSwan(register: any, value: any): void;
    writeWonderSwanMemory(offset: any, value: any): void;
    loadWonderSwanMemory(data: any, offset?: number): void;
    clearWonderSwanMemory(): void;
    setChannelMuted(channel: any, muted: any): void;
    reset(): void;
    dispose(): void;
    updateSpeakerCenter(): void;
    speakerTick(): void;
    /** Borrowed, speaker-centered PCM. Consume before the next render or dispose.
     * Stable frame sizes reuse the core's output views and allocate no PCM arrays.
     * @param {number} frames
     * @returns {Readonly<{left:Float32Array,right:Float32Array}>}
     */
    generateStereoView(frames: number): Readonly<{
        left: Float32Array;
        right: Float32Array;
    }>;
    /** Owned speaker-centered PCM, valid after subsequent renders and disposal. */
    processFrames(frames: any): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
    };
    process(left: any, right: any, frames: any): void;
}
/** @param {WonderSwanAudioEngineOptions} [options] */
export declare const createWonderSwanAudioEngine: (options?: WonderSwanAudioEngineOptions) => Promise<WonderSwanAudioEngine>;

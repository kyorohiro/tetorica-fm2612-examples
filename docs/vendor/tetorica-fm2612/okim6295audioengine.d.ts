/** Four mono ADPCM voices. Synchronous rendering for VGM, no audio device. */
export declare class Oki6295AudioEngine {
    initialClock: number;
    rate: number;
    rom: Uint8Array<ArrayBuffer>;
    muted: boolean;
    volume: number | undefined;
    clock: any;
    clockBuffer: any;
    pin7: boolean | undefined;
    bank: number | undefined;
    nmkMode: number | undefined;
    nmkBanks: Uint8Array<ArrayBuffer> | undefined;
    pending: number | undefined;
    phase: number | undefined;
    voices: {
        playing: boolean;
        signal: number;
        step: number;
        output: number;
    }[] | undefined;
    constructor({ clock, outputSampleRate, masterVolume }: {
        clock: any;
        masterVolume?: number | undefined;
        outputSampleRate?: number | undefined;
    });
    sampleRate(): number;
    /** @param {number} v */
    setMasterVolume(v: number): void;
    getMasterVolume(): number | undefined;
    /** @param {boolean} v */
    setOki6295Muted(v: boolean): void;
    supportsState(): boolean;
    reset(): void;
    dispose(): void;
    /** @param {Uint8Array} data
     * @param {number} size
     * @param {number} [offset] */
    loadOki6295Rom(data: Uint8Array, offset?: number, size?: number): void;
    clearOki6295Rom(): void;
    /** @param {number} address */
    readRom(address: number): number;
    readStatus(): number;
    /** @param {number} register  @param {number} value */
    writeOki6295(register: number, value: number): void;
    command(value: any): void;
    tick(): void;
    /** @param {number} frames */
    processFrames(frames: number): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
    };
}
/**
 * Add OKIM6295 rendering, ROM uploads and mute controls to an engine in place.
 * Combined state snapshots are disabled; reset/dispose cover both engines.
 * @template {{processFrames: (frames: number) => {left: Float32Array, right: Float32Array}, reset: () => void, dispose: () => void, getMasterVolume: () => number}} Engine
 * @param {Engine} engine Primary engine whose master volume also scales ADPCM.
 * @param {Oki6295AudioEngine} oki ADPCM engine to attach.
 * @returns The mutated primary engine with OKIM6295 controls.
 */
export declare function attachOki6295<Engine extends {
    processFrames: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    reset: () => void;
    dispose: () => void;
    getMasterVolume: () => number;
}>(engine: Engine, oki: Oki6295AudioEngine): Engine;

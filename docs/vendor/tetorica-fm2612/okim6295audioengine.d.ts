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
    nmkMode: any;
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
    setMasterVolume(v: any): void;
    getMasterVolume(): number | undefined;
    setOki6295Muted(v: any): void;
    supportsState(): boolean;
    reset(): void;
    dispose(): void;
    loadOki6295Rom(data: any, offset?: number, size?: any): void;
    clearOki6295Rom(): void;
    readRom(address: any): number;
    readStatus(): number;
    writeOki6295(register: any, value: any): void;
    command(value: any): void;
    tick(): void;
    processFrames(frames: any): {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
}
export declare function attachOki6295(engine: any, oki: any): any;

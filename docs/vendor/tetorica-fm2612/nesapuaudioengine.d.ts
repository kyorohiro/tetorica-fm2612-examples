import { FdsAudio } from './fds_audio.js';
import PAPU from './nes_apu_vendor/index.js';
export declare function validateNesApuClock(clock: any): void;
export declare class NesApuAudioEngine {
    #private;
    fdsEnabled: boolean;
    clock: number;
    region: string;
    rate: number;
    mask: number;
    memory: any;
    samples: any;
    fds: FdsAudio | null | undefined;
    apu: PAPU | null | undefined;
    volume: number | undefined;
    constructor({ clock, outputSampleRate, masterVolume, fds }?: {
        clock?: number | undefined;
        fds?: boolean | undefined;
        masterVolume?: number | undefined;
        outputSampleRate?: number | undefined;
    });
    sampleRate(): number;
    supportsState(): boolean;
    stateSettingsKey(): string;
    saveState(): Readonly<{
        byteLength: any;
    }>;
    validateState(state: any): void;
    loadState(state: any): void;
    reset(): void;
    dispose(): void;
    writeNesApu(register: any, value: any): void;
    loadNesMemory(data: any, offset: any): void;
    setChannelMuted(channel: any, muted: any): void;
    setMasterVolume(value: any): void;
    getMasterVolume(): number | undefined;
    process(left: any, right: any, frames: any): void;
    processFrames(frames: any): {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
}
export declare const createNesApuAudioEngine: (options: any) => Promise<NesApuAudioEngine>;

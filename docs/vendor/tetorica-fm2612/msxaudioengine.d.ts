import { MultiChipAudioEngine } from './multichipaudioengine.js';
/**
 * MsxAudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class MsxAudioEngine extends MultiChipAudioEngine {
    /**
     * Create the chip instances required by this engine.
     * @param {Object} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<MsxAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        outputSampleRate?: number;
        masterVolume?: number;
    }): Promise<MsxAudioEngine>;
    writeYm2151(register: any, value: any, index?: number): void;
    setOpmMuted(value: any): void;
    setOpmChannelMuted(channel: any, value: any): void;
    writeAy8910(register: any, value: any, index?: number): void;
    writeYm2413(register: any, value: any, index?: number): void;
    writeY8950(register: any, value: any, index?: number): void;
    writeK051649(port: any, register: any, value: any, index?: number): void;
    setAyMuted(value: any): void;
    setAyChannelMuted(channel: any, value: any): void;
    setOpllMuted(value: any): void;
    setY8950Muted(value: any): void;
    setSccMuted(value: any): void;
    setSccChannelMuted(channel: any, value: any): void;
}
export declare const createMsxAudioEngine: (options: any) => Promise<MsxAudioEngine>;
export declare function validateMsxPlaybackHeader(header: any): void;

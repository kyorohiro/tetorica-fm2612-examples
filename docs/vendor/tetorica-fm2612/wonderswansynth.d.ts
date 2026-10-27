import { WONDERSWAN_CLOCK } from './wonderswan.js';
export { WONDERSWAN_CLOCK };
export { WonderSwanWorkletTransport } from './chip_worklet_transport.js';
/** Borrow a synchronous WonderSwan core; disposing the synth does not destroy it. */
export declare class WonderSwanDirectTransport {
    chip: any;
    constructor(chip: any);
    writeRegister(address: any, value: any): void;
    writeMemory(address: any, value: any): void;
    reset(): void;
}
/** Four-channel, 32-sample, four-bit wavetable authoring API.
 * Configure initialize() before high-level operations. Channels are physical
 * 0..3; voice mode replaces channel 1, sweep uses channel 2, noise uses channel 3.
 * Registers/RAM retained here describe authored commands, not live core reads.
 */
export declare class WonderSwanSynth {
    #private;
    clock: number;
    /** @param {{transport:{writeRegister(address:number,value:number,channel?:number,controlMask?:number):void,writeMemory(address:number,value:number,channel?:number):void,reset():void,dispose?():void},clock?:number}} options */
    constructor({ transport, clock }?: {
        transport: {
            writeRegister(address: number, value: number, channel?: number, controlMask?: number): void;
            writeMemory(address: number, value: number, channel?: number): void;
            reset(): void;
            dispose?(): void;
        };
        clock?: number;
    });
    /** Absolute hardware address 0x80..0x9f; value is one byte. */
    writeRegister(address: any, value: any): void;
    /** Write one packed byte in the owned 16 KiB wave RAM. */
    writeMemory(address: any, value: any): void;
    /** Upload packed wave bytes; each byte stores two samples, low nibble first. */
    loadMemory(bytes: any, offset?: number): void;
    /** Cold reset, including RAM and authored state; initialize() restores defaults. */
    reset(): void;
    /** Silent, centered triangle-wave voices with left/right hardware volumes 9/9. */
    initialize(): void;
    /** Permit high-level operations after configuring registers/RAM manually. */
    adoptRegisterState(): void;
    /** Stop this channel and replace its 32 four-bit samples, at the current wave bank. */
    setWaveform(channel: any, samples: any): void;
    /** Hardware left/right volumes 0..15. In voice mode CH1's volume byte is PCM data. */
    setVolume(channel: any, left: any, right?: any): void;
    setPan(channel: any, left: any, right?: any): void;
    /** Set Hz without enabling the channel; returns quantized Hz.
     * The source stream runs at floor(clock / 128), advancing 128 master cycles.
     * The 11-bit register encodes 2048 minus a period of 1..2048 cycles.
     */
    setFrequency(channel: any, hz: any): number;
    /** A note name such as A4 or integer MIDI 0..127; numeric notes are never Hz. */
    setNote(channel: any, note: any): number;
    keyOn(channel: any): void;
    keyOff(channel: any): void;
    noteOn(channel: any, note: any): void;
    /** Preserve voice/sweep/noise modes, waveforms and volumes while releasing all voices. */
    allNotesOff(): void;
    /** Hardware noise on physical channel 3; type selects one of eight LFSR taps. */
    setNoise(options: any): void;
    /** Sweep on physical channel 2: signed register step, and time code 0..31. */
    setSweep(options: any): void;
    /** Replace physical CH1's wavetable with unsigned 8-bit PCM; does not key it on. */
    setVoiceMode(enabled: any): void;
    /** Write unsigned PCM 0..255, centered at 128. This is an immediate write, not a stream. */
    writeVoice(value: any): void;
    /** Build an offline score; authoring calls collect writes without sounding the chip. */
    createTimeline({ clock, pcmData }?: {
        clock?: number | undefined;
        pcmData?: Uint8Array<ArrayBuffer> | undefined;
    }): WonderSwanTimelineBuilder;
    /** Validate and prepare a complete 44100 Hz score before starting audio. */
    prepareTimeline(timeline: any): any;
    /** Resolves when the prepared score finishes; cancellation rejects the request. */
    playTimeline(): Promise<any>;
    stopTimeline(): any;
    /** Retain a packed score's final PCM byte without copying its entire RAM shadow. */
    _adoptVoiceByte(value: any): void;
    /** Internal authored state for Main/Worker handoff; never live register readback. */
    _getState(): {
        clock: number;
        initialized: boolean;
        registers: number[];
        memory: number[];
    };
    /** Merge a Native editor's explicit fields into future authored state. */
    _applyAuthorEdit(patch: any): void;
    /** Adopt authored state without replaying writes, resets or hardware triggers. */
    _adoptState(state: any): void;
    dispose(): void;
}
/** A score uses the same register/high-level API as a synth, with an explicit
 * source sample position. PCM remains packed until the audio renderer reads it.
 */
export declare class WonderSwanTimelineBuilder extends WonderSwanSynth {
    #private;
    constructor({ clock, pcmData }?: {
        clock?: number | undefined;
        pcmData?: Uint8Array<ArrayBuffer> | undefined;
    });
    /** Advance to an absolute sample position in the source's 44100 Hz timebase. */
    at(sample: any): this;
    /** Append a packed Voice PCM run at the current position, retaining its deltas. */
    pcm(offset: any, length: any, count: any, endSample: any): this;
    finish(durationSamples?: number): {
        version: number;
        clock: number;
        durationSamples: any;
        events: any;
        pcmData: Uint8Array<any>;
    };
}

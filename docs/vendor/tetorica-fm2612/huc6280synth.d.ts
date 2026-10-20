/** HuC6280 PSG input clock (Hz), after the PC Engine master clock divider. */
export declare const HUC6280_CLOCK = 3579545;
/** Borrow a synchronous HuC6280 rendering engine; disposing the synth does not destroy it. */
export declare class Huc6280DirectTransport {
    chip: import("./huc6280audioengine.js").Huc6280AudioEngine;
    /** @param {import('./huc6280audioengine.js').Huc6280AudioEngine} chip */
    constructor(chip: import('./huc6280audioengine.js').Huc6280AudioEngine);
    /** @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    reset(): void;
}
/** Six-channel, 32-sample, five-bit wavetable authoring API.
 * Configure with initialize() before high-level operations. Values are hardware
 * units: volume 0..31, left/right balance 0..15, noise frequency code 0..31.
 * Waveform uploads stop that channel; call noteOn()/keyOn() afterward.
 */
export declare class Huc6280Synth {
    #private;
    clock: number;
    /** @param {{transport:{writeRegister(register:number,value:number,channel?:number):void,reset():void,dispose?():void},clock?:number}} options */
    constructor({ transport, clock }?: {
        transport: {
            writeRegister(register: number, value: number, channel?: number): void;
            reset(): void;
            dispose?(): void;
        };
        clock?: number;
    });
    /** Write a hardware register. Channel select also accepts the two unused slots 6/7.
     * @param {number} register Address 0..9. @param {number} value Byte 0..255. */
    writeRegister(register: number, value: number): void;
    /** Reset core and authoring state. Call initialize() to restore useful defaults. */
    reset(): void;
    /** Configure silent, centered triangle-wave voices on all six channels. */
    initialize(): void;
    /** Adopt registers written through this synth, without resetting hardware. */
    adoptRegisterState(): void;
    /** Stop a channel and replace its waveform; values are exactly 32 integers 0..31.
     * @param {number} channel @param {number[]|Uint8Array} samples */
    setWaveform(channel: number, samples: number[] | Uint8Array): void;
    /** Set attenuation level without changing key/DDA state. @param {number} channel @param {number} volume 0..31. */
    setVolume(channel: number, volume: number): void;
    /** Independent channel left/right balances, 0=mute and 15=full. @param {number} channel @param {number} left @param {number} [right=left] */
    setPan(channel: number, left: number, right?: number): void;
    /** Global left/right balances. @param {number} left @param {number} [right=left] */
    setMasterVolume(left: number, right?: number): void;
    /** Set wavetable Hz without enabling the channel; returns quantized Hz.
     * The 12-bit period 0 encodes 4096, the longest hardware period.
     * @param {number} channel @param {number} hz @returns {number} */
    setFrequency(channel: number, hz: number): number;
    /** @param {number} channel @param {string|number} note Note name or integer MIDI 0..127. */
    setNote(channel: number, note: string | number): number;
    /** @param {number} channel */
    keyOn(channel: number): void;
    /** @param {number} channel */
    keyOff(channel: number): void;
    /** @param {number} channel @param {string|number} note */
    noteOn(channel: number, note: string | number): void;
    /** Silence every channel while retaining volume, waveform and DDA settings. */
    allNotesOff(): void;
    /** Noise is available on physical channels 4 and 5. Frequency is the hardware
     * code 0..31, increasing toward faster noise; this is not a Hz argument.
     * @param {number} channel @param {{enabled:boolean,frequency?:number}} options */
    setNoise(channel: number, options: {
        enabled: boolean;
        frequency?: number;
    }): void;
    /** Switch between wavetable and direct five-bit DAC mode, retaining key state.
     * @param {number} channel @param {boolean} enabled */
    setDda(channel: number, enabled: boolean): void;
    /** Write one direct DAC sample; 16 is center. Enable DDA mode first.
     * @param {number} channel @param {number} sample */
    writeDda(channel: number, sample: number): void;
    /** Hardware LFO modulates channel 0 from channel 1's wavetable. Channel 1 is
     * still audible; mute it with setVolume(1,0) if only modulation is desired.
     * reset=true holds the hardware LFO reset bit; pass false to let it advance.
     * @param {{frequency:number,depth:0|1|2|3,reset?:boolean}} options */
    setLfo(options: {
        frequency: number;
        depth: 0 | 1 | 2 | 3;
        reset?: boolean;
    }): void;
    /** Internal authoring state, for execution-thread handoff; not live core readback. */
    _getState(): {
        clock: number;
        initialized: boolean;
        selectedChannel: number;
        globals: number[];
        registers: number[][];
        waveforms: number[][];
        indices: number[];
    };
    _adoptState(state: any): void;
    dispose(): void;
}

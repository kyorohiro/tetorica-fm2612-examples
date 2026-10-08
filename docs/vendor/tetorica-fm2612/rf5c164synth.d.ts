/** Direct synchronous transport; the caller owns and disposes the chip. */
export declare class RF5C164DirectTransport {
    chip: import("./rf5c164.js").Rf5c164;
    /** @param {import('./rf5c164.js').Rf5c164} chip */
    constructor(chip: import('./rf5c164.js').Rf5c164);
    write(register: any, value: any): void;
    loadMemory(bytes: any, address: any): void;
    reset(): void;
}
/** Physical-channel controls. A new/reset chip is expected; route raw writes through this Synth. */
export declare class RF5C164Synth {
    transport: {
        (Uint8Array: any, number: any): any;
        (): void;
        write: (register: number, value: number) => void;
        loadMemory: Function;
        reset: Function;
    };
    channelMask: number;
    /** @param {{transport: {write: (register: number, value: number) => void, loadMemory: function(Uint8Array, number): *, reset: function(): void}}} options
     * Transport writes/reset must be synchronous or FIFO fire-and-forget. Memory transfer may return a completion promise.
     */
    constructor({ transport }?: {
        transport: {
            write: (register: number, value: number) => void;
            loadMemory: Function;
            (Uint8Array: any, number: any): any;
            reset: Function;
            (): void;
        };
    });
    /** Copy chip-encoded bytes into absolute 64 KiB RAM. Await when using an asynchronous transport. */
    loadMemory(bytes: any, address?: number): any;
    /** Raw register write, also updating the tracked active-low channel mask. */
    writeRegister(register: any, value: any): void;
    _select(channel: any): void;
    /** @param {number} channel Physical index 0..7.
     * @param {{start?: number, loopStart?: number, step?: number, volume?: number, pan?: {left: number, right: number}}} options
     * Unspecified registers retain their values. start is a 256-byte-aligned RAM address.
     */
    setChannel(channel: number, options: {
        start?: number;
        loopStart?: number;
        step?: number;
        volume?: number;
        pan?: {
            left: number;
            right: number;
        };
    }): void;
    /** Set raw 16-bit playback step, not a MIDI note. */
    setPitch(channel: any, step: any): void;
    /** Retrigger the selected physical channel; other channels keep playing. */
    keyOn(channel: any): void;
    keyOff(channel: any): void;
    /** Reset registers and mask while retaining waveform RAM. */
    reset(): void;
}

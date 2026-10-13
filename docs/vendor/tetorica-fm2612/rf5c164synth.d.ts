/** Direct synchronous transport; the caller owns and disposes the chip. */
export declare class RF5C164DirectTransport {
    chip: import("./rf5c164.js").Rf5c164;
    /** @param {import('./rf5c164.js').Rf5c164} chip */
    constructor(chip: import('./rf5c164.js').Rf5c164);
    /** @param {number} register
     * @param {number} value */
    write(register: number, value: number): void;
    /** @param {Uint8Array} bytes
     * @param {number} address */
    loadMemory(bytes: Uint8Array, address: number): void;
    reset(): void;
}
/** Physical-channel controls. A new/reset chip is expected; route raw writes through this Synth. */
export declare class RF5C164Synth {
    transport: {
        (): void;
        write: (register: number, value: number) => void;
        loadMemory: (bytes: Uint8Array, address: number) => void | Promise<unknown>;
        reset: Function;
    };
    channelMask: number;
    /** @param {{transport: {write: (register: number, value: number) => void, loadMemory: (bytes:Uint8Array, address:number)=>void|Promise<unknown>, reset: function(): void}}} options
     * Transport writes/reset must be synchronous or FIFO fire-and-forget. Memory transfer may return a completion promise.
     */
    constructor({ transport }?: {
        transport: {
            write: (register: number, value: number) => void;
            loadMemory: (bytes: Uint8Array, address: number) => void | Promise<unknown>;
            reset: Function;
            (): void;
        };
    });
    /** Copy chip-encoded bytes into absolute 64 KiB RAM. Await when using an asynchronous transport. @param {Uint8Array|ArrayBuffer} bytes @param {number} [address] */
    loadMemory(bytes: Uint8Array | ArrayBuffer, address?: number): void | Promise<unknown>;
    /** Raw register write, also updating the tracked active-low channel mask. @param {number} register @param {number} value */
    writeRegister(register: number, value: number): void;
    /** @param {number} channel */
    _select(channel: number): void;
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
    /** Set raw 16-bit playback step, not a MIDI note. @param {number} channel @param {number} step */
    setPitch(channel: number, step: number): void;
    /** Retrigger the selected physical channel; other channels keep playing. @param {number} channel */
    keyOn(channel: number): void;
    /** @param {number} channel */
    keyOff(channel: number): void;
    /** Reset registers and mask while retaining waveform RAM. */
    reset(): void;
}

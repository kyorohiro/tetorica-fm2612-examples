/** Register transports: Synth stays on the caller thread, chip runs in AudioWorklet. */
export declare class ChipWorkletTransport {
    endpoint: MessagePort | import("./soundchip_worklet.js").WorkletSoundChip | null;
    port: any;
    disposed: boolean;
    /** @param {import("./soundchip_worklet.js").WorkletSoundChip | MessagePort} endpoint */
    constructor(endpoint: import("./soundchip_worklet.js").WorkletSoundChip | MessagePort);
    send(method: any, args: any): void;
    reset(): void;
    write(...args: any[]): void;
    writeRegister(...args: any[]): void;
    start(): void | Promise<void>;
    stop(): any;
    flush(): any;
    dispose(): void;
    close(): Promise<void>;
}
export declare class GameboyWorkletTransport extends ChipWorkletTransport {
}
export declare class SegaPSGWorkletTransport extends ChipWorkletTransport {
}
export declare class YM2151WorkletTransport extends ChipWorkletTransport {
}
export declare class YM2413WorkletTransport extends ChipWorkletTransport {
}
export declare class OPLWorkletTransport extends ChipWorkletTransport {
}
export declare class YM3526WorkletTransport extends OPLWorkletTransport {
}
export declare class YM3812WorkletTransport extends OPLWorkletTransport {
}
export declare class Y8950WorkletTransport extends OPLWorkletTransport {
}
export declare class YMF262WorkletTransport extends OPLWorkletTransport {
}
export declare class AY8910WorkletTransport extends ChipWorkletTransport {
}
export type WonderSwanScheduledWrite = {
    time: number;
    register?: number;
    address?: number;
    value: number;
    port?: 0;
};
/** A register write scheduled in absolute AudioContext seconds.
 * @typedef {{time:number,register?:number,address?:number,value:number,port?:0}} WonderSwanScheduledWrite
 */
/** Borrow a WonderSwan AudioWorklet endpoint or transferred transport port.
 * Reads and RAM uploads acknowledge work on the audio thread. Disposing this
 * transport releases its requests/listeners, without destroying a borrowed chip.
 */
export declare class WonderSwanWorkletTransport extends ChipWorkletTransport {
    #private;
    /** @param {import('./soundchip_worklet.js').WorkletSoundChip | MessagePort} endpoint */
    constructor(endpoint: import('./soundchip_worklet.js').WorkletSoundChip | MessagePort);
    /** Absolute hardware register 0x80..0x9f. Optional ownership metadata is used by Synth.
     * @param {number} address
     * @param {number} value
     * @param {number} [channel]
     * @param {number} [controlMask]
     */
    writeRegister(address: number, value: number, channel?: number, controlMask?: number): void;
    /** Write one packed byte in the 16 KiB wave RAM.
     * @param {number} address
     * @param {number} value
     * @param {number} [channel]
     */
    writeMemory(address: number, value: number, channel?: number): void;
    reset(): void;
    /** Copy and upload packed wave RAM, resolving after the audio thread applies it.
     * @param {Uint8Array} bytes
     * @param {number} [offset=0]
     * @returns {Promise<void>}
     */
    loadMemory(bytes: Uint8Array, offset?: number): Promise<void>;
    /** @param {number} address @returns {Promise<number>} */
    readRegister(address: number): Promise<number>;
    /** @param {number} address @returns {Promise<number>} */
    readMemory(address: number): Promise<number>;
    /** @param {number} channel @param {boolean} muted @returns {Promise<void>} */
    setChannelMuted(channel: number, muted: boolean): Promise<void>;
    /** Queue at most 65536 pending writes before playback. The input is copied.
     * @param {WonderSwanScheduledWrite[]} entries
     * @returns {Promise<number>} Number of accepted writes.
     */
    scheduleWrites(entries: WonderSwanScheduledWrite[]): Promise<number>;
    /** @returns {Promise<void>} */
    clearScheduledWrites(): Promise<void>;
    /** Resolve only after all prior messages on this transport port were applied. */
    flush(): Promise<void>;
    dispose(): void;
}
export type PokeyScheduledWrite = {
    time: number;
    register?: number;
    address?: number;
    value: number;
    port?: 0;
};
/** A register write scheduled in absolute AudioContext seconds.
 * @typedef {{time:number,register?:number,address?:number,value:number,port?:0}} PokeyScheduledWrite
 */
/** Borrow a Pokey AudioWorklet endpoint or transferred transport port.
 * Reads acknowledge work on the audio thread. Disposing this
 * transport releases its requests/listeners, without destroying a borrowed chip.
 */
export declare class PokeyWorkletTransport extends ChipWorkletTransport {
    #private;
    /** @param {import('./soundchip_worklet.js').WorkletSoundChip | MessagePort} endpoint */
    constructor(endpoint: import('./soundchip_worklet.js').WorkletSoundChip | MessagePort);
    /** Absolute hardware register 0x00..0x0f. Optional ownership metadata is used by Synth.
     * @param {number} address
     * @param {number} value
     * @param {number} [channel]
     */
    writeRegister(address: number, value: number, channel?: number): void;
    get clock(): any;
    reset(): void;
    /** Hardware read map, not the write-only authored register bank.
     * @param {number} address @returns {Promise<number>} */
    readRegister(address: number): Promise<number>;
    /** Authored write bank and monitoring mutes, never hardware read aliases.
     * @returns {Promise<{clock:number,registers:number[],mutedChannels:number[]}>} */
    getState(): Promise<{
        clock: number;
        registers: number[];
        mutedChannels: number[];
    }>;
    /** @param {number} channel @param {boolean} muted @returns {Promise<void>} */
    setChannelMuted(channel: number, muted: boolean): Promise<void>;
    /** Queue at most 65536 pending writes before playback. The input is copied.
     * @param {PokeyScheduledWrite[]} entries
     * @returns {Promise<number>} Number of accepted writes.
     */
    scheduleWrites(entries: PokeyScheduledWrite[]): Promise<number>;
    /** @returns {Promise<void>} */
    clearScheduledWrites(): Promise<void>;
    /** Resolve only after all prior messages on this transport port were applied. */
    flush(): Promise<void>;
    dispose(): void;
}

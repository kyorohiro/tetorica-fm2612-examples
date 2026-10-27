import { POKEY_CLOCK } from './pokey.js';
export { POKEY_CLOCK };
export { PokeyWorkletTransport } from './chip_worklet_transport.js';
/** Borrow a synchronous core; disposing this transport never destroys it. */
export declare class PokeyDirectTransport {
    chip: import("./pokey.js").Pokey;
    clock: number;
    /** @param {import('./pokey.js').Pokey} chip */
    constructor(chip: import('./pokey.js').Pokey);
    writeRegister(register: any, value: any): void;
    readRegister(register: any): number;
    reset(): void;
}
/** Four physical channels, zero based. AUDCTL clock/join/filter settings are
 * shared by the chip. A joined pair sounds on its upper channel (1 or 3),
 * consuming the lower channel's timer. Two objects never share authored state.
 * Readback belongs to the transport/core: this shadow records writes only.
 */
export declare class PokeySynth {
    #private;
    clock: any;
    chip: string;
    channels: number;
    /** @type {((register:number,value:number,channel?:number)=>boolean|void)|undefined} */ _beforeWrite: ((register: number, value: number, channel?: number) => boolean | void) | undefined;
    /** @type {((event:{method:string,args:number[],channel?:number})=>void)|undefined} */ _observe: ((event: {
        method: string;
        args: number[];
        channel?: number;
    }) => void) | undefined;
    /** @param {{transport:{writeRegister(register:number,value:number,channel?:number):void,reset():void,dispose?():void,clock?:number},clock?:number}} options */
    constructor({ transport, clock }?: {
        transport: {
            writeRegister(register: number, value: number, channel?: number): void;
            reset(): void;
            dispose?(): void;
            clock?: number;
        };
        clock?: number;
    });
    /** Write-only hardware bank, local offsets 0..15. */
    writeRegister(register: any, value: any): void;
    reset(): void;
    /** Silent pure-tone voices, distortion 5, retained volume 8, 64 kHz timers.
     * SKCTL=3 starts the timers/polynomials; STIMER restarts all four counters. */
    initialize(): void;
    adoptRegisterState(): void;
    getRegisterSnapshot(): Uint8Array<ArrayBuffer>;
    /** Hardware volume 0..15; silent voices retain it until keyOn(). */
    setVolume(channel: any, volume: any): void;
    /** AUDC bits 7..5; 5 (0xa0) is a pure square tone. */
    setDistortion(channel: any, distortion: any): void;
    /** AUDC volume-only DAC mode; phase/timers continue in the core. */
    setVolumeOnly(channel: any, enabled: any): void;
    /** Master-clock timers exist on physical channels 0 and 2 only. */
    setHighClock(channel: any, enabled: any): void;
    /** Join pair 0=(0,1), pair 1=(2,3). The lower helper is silenced. */
    setJoined(pair: any, enabled: any): void;
    /** Shared base divisor: 28 or 114 input clocks. */
    setBaseClock(clock: any): void;
    setPoly9(enabled: any): void;
    /** Set pure-tone frequency without changing gates; noise modes retain the
     * same timer period but their audible pitch depends on polynomial selection.
     * Joined lower channels cannot be tuned independently. Returns quantized Hz. */
    setFrequency(channel: any, hz: any): number;
    setNote(channel: any, note: any): number;
    keyOn(channel: any): void;
    keyOff(channel: any): void;
    noteOn(channel: any, note: any): void;
    allNotesOff(): void;
    _getState(): {
        clock: any;
        initialized: boolean;
        registers: number[];
        levels: number[];
    };
    /** Adopt authored state without triggering the hardware read-only map. */
    _adoptState(state: any): void;
    dispose(): void;
}

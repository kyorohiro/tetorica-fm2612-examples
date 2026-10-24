import { ChipWorkletTransport } from './chip_worklet_transport.js';
export type NesApuTransport = {
    writeRegister(address: number, value: number): void;
    reset?: () => void;
    setChannelEnabled?: (channel: number, enabled: boolean) => void;
    configureFds?: (gain: number, master: number) => void;
    loadMemory?: (bytes: Uint8Array, address: number) => void | Promise<unknown>;
    clock?: number;
    fdsEnabled?: boolean;
};
export type NesPulseVoice = {
    volume?: number;
    duty?: 0.125 | 0.25 | 0.5 | 0.75;
    envelope?: {
        period: number;
        loop?: boolean;
    };
    sweep?: {
        enabled?: boolean;
        period?: number;
        negate?: boolean;
        shift?: number;
    };
};
/** Owns no chip or audio device. */
export declare class NesApuDirectTransport {
    chip: import("./nesapu.js").NesApu | import("./nesapu_wasm.js").NesApuWasm;
    clock: any;
    fdsEnabled: any;
    /** @param {import('./nesapu.js').NesApu | import('./nesapu_wasm.js').NesApuWasm} chip */
    constructor(chip: import('./nesapu.js').NesApu | import('./nesapu_wasm.js').NesApuWasm);
    /** @param {number} address @param {number} value */
    writeRegister(address: number, value: number): void;
    /** @param {Uint8Array} bytes @param {number} address */
    loadMemory(bytes: Uint8Array, address: number): void;
    /** @param {number} channel @param {boolean} enabled */
    setChannelEnabled(channel: number, enabled: boolean): void;
    reset(): void;
    sampleRate(): any;
    /** @param {number} frames */
    generateStereo(frames: number): {
        left: any;
        right: any;
    };
}
export declare class NesApuWorkletTransport extends ChipWorkletTransport {
    clock: any;
    fdsEnabled: any;
    /** @param {import('./soundchip_worklet.js').WorkletSoundChip | MessagePort} endpoint */
    constructor(endpoint: import('./soundchip_worklet.js').WorkletSoundChip | MessagePort);
    /** @param {number} channel @param {boolean} enabled */
    setChannelEnabled(channel: number, enabled: boolean): void;
    /** @param {Uint8Array} bytes @param {number} address */
    loadMemory(bytes: Uint8Array, address: number): any;
}
/** NES tones and optional FDS. Pulse indices 0/1; common tone channels 0/1/2/5. */
export declare class NesApuSynth {
    #private;
    transport: NesApuTransport;
    clock: number;
    fdsEnabled: boolean;
    pulse: {
        /** @param {0|1} channel @param {NesPulseVoice} voice */
        setVoice: (channel: 0 | 1, voice: NesPulseVoice) => void;
        /** @param {0|1} channel @param {string|number} note */
        setNote: (channel: 0 | 1, note: string | number) => number;
        /** Set Hz without starting playback. Returns the hardware timer period.
         * @param {0|1} channel @param {number} hz */
        setFrequency: (channel: 0 | 1, hz: number) => number;
        /** Start/retrigger the configured pitch without replacing it.
         * @param {0|1} channel */
        keyOn: (channel: 0 | 1) => void;
        /** Stop playback while keeping the configured pitch. @param {0|1} channel */
        keyOff: (channel: 0 | 1) => void;
        /** @param {0|1} channel @param {string|number} note */
        noteOn: (channel: 0 | 1, note: string | number) => void;
        /** @param {0|1} channel */
        noteOff: (channel: 0 | 1) => void;
    };
    triangle: {
        /** @param {number} hz */ setFrequency: (hz: number) => number;
        keyOn: () => void;
        keyOff: () => void;
        /** @param {string|number} note */ setNote: (note: string | number) => number;
        /** @param {string|number} note */ noteOn: (note: string | number) => void;
        noteOff: () => void;
    };
    noise: {
        /** @param {{volume?:number,period?:number,shortMode?:boolean}} [options] */
        setVoice: ({ volume, period, shortMode }?: {
            volume?: number;
            period?: number;
            shortMode?: boolean;
        }) => void;
        noteOn: () => void;
        noteOff: () => void;
    };
    dmc: {
        /** Pre-encoded DPCM, padded to 16*n+1 bytes. No PCM encoder or ROM needed.
         * @param {Uint8Array|ArrayBuffer} input @param {{address?:number}} [options] */
        loadSample: (input: Uint8Array | ArrayBuffer, { address }?: {
            address?: number;
        }) => Promise<{
            address: number;
            length: number;
        }>;
        /** @param {{rate?:number,loop?:boolean,level?:number}} [options] */
        play: ({ rate, loop, level }?: {
            rate?: number;
            loop?: boolean;
            level?: number;
        }) => void;
        stop: () => void;
    };
    fds: {
        /** @param {ArrayLike<number>} values 64 wave samples, 0..63. */
        setWave: (values: ArrayLike<number>) => void;
        /** @param {number} volume Fixed gain 0..32. @param {number} [master] Hardware scale 0..3. */
        setVolume: (volume: number, master?: number) => void;
        /** @param {number} hz */ setFrequency: (hz: number) => number;
        keyOn: () => void;
        keyOff: () => void;
        /** @param {string|number} note */ setNote: (note: string | number) => number;
        /** @param {string|number} note */ noteOn: (note: string | number) => void;
        noteOff: () => void;
        /** @param {{table:ArrayLike<number>,rate?:number,depth?:number,bias?:number,enabled?:boolean}} options */
        setModulation: ({ table: values, rate, depth, bias, enabled }: {
            table: ArrayLike<number>;
            rate?: number;
            depth?: number;
            bias?: number;
            enabled?: boolean;
        }) => void;
    };
    /** @param {{transport:NesApuTransport, clock?:number, fds?:boolean, initialize?:boolean}} options */
    constructor({ transport, clock, fds, initialize }?: {
        transport: NesApuTransport;
        clock?: number;
        fds?: boolean;
        initialize?: boolean;
    });
    _getState(): {
        clock: number;
        registers: number[];
        enabled: number;
        fdsActive: boolean;
        fdsGain: number;
        fdsMaster: number;
        sample: {
            address: number;
            length: number;
        } | null;
    };
    _adoptState(state: any): void;
    /** @param {number} address @param {number} value */
    writeRegister(address: number, value: number): void;
    /** Reset native registers and the shadow without writing Synth voice defaults. */
    resetRegisters(): void;
    /** Upload raw CPU RAM without DMC alignment, padding or playback configuration.
     * @param {Uint8Array|ArrayBuffer} input @param {number} [address=0] CPU RAM address.
     * @returns {void|Promise<unknown>} Await acknowledgement on a Worklet transport.
     */
    loadMemory(input: Uint8Array | ArrayBuffer, address?: number): void | Promise<unknown>;
    reset(): void;
    /** @param {0|1|2|5} channel @param {number} hz */
    setFrequency(channel: 0 | 1 | 2 | 5, hz: number): number;
    /** Configure a note without triggering. @param {0|1|2|5} channel @param {string|number} note */
    setNote(channel: 0 | 1 | 2 | 5, note: string | number): number;
    /** @param {0|1|2|5} channel @param {string|number} note */
    noteOn(channel: 0 | 1 | 2 | 5, note: string | number): void;
    /** Start/retrigger the configured timer or FDS frequency without changing pitch.
     * @param {0|1|2|5} channel */
    keyOn(channel: 0 | 1 | 2 | 5): void;
    /** Stop a channel without replacing its configured pitch. @param {number} channel */
    keyOff(channel: number): void;
    /** @param {number} channel */
    noteOff(channel: number): void;
}

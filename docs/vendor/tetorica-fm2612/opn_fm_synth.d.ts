export type OPNTransport = import('./ym2612synth.js').YM2612Transport;
/**
 * Direct bus transport for `Ym2203` and `Ym2608` wrappers.
 * Their WASM API uses address/data offsets rather than a packed register
 * method, while the synth API consistently uses `write(port, reg, value)`.
 */
/** @template {{write(offset:number,value:number):void}} Chip */
export declare class OPNDirectTransport<Chip extends {
    write(offset: number, value: number): void;
}> {
    chip: Chip;
    chipName: string;
    portCount: number;
    /** @param {Chip} chip
     * @param {{chipName:string, portCount:number}} config */
    constructor(chip: Chip, { chipName, portCount }: {
        chipName: string;
        portCount: number;
    });
    reset(): void;
    /** @param {number} port
     * @param {number} register
     * @param {number} value */
    write(port: number, register: number, value: number): void;
    /** @param {number} offset
     * @returns {number} Register value; zero when native reads are unavailable. */
    read(offset: number): number;
    /** @returns {number} */
    readStatus(): number;
    /** @returns {boolean} */
    getIrq(): boolean;
}
/**
 * Worklet transport shared by browser-hosted OPN chips. The worklet protocol
 * uses the same port/register/value shape as the high-level FM API.
 */
export declare class OPNWorkletTransport {
    /** @type {import('./soundchip_worklet.js').WorkletSoundChip|null} */
    endpoint: import('./soundchip_worklet.js').WorkletSoundChip | null;
    node: AudioWorkletNode | MessagePort | import("./soundchip_worklet.js").WorkletSoundChip;
    portCount: number;
    chipName: string;
    memorySequence: number;
    memoryRequests: Map<any, any>;
    disposed: boolean;
    onMemoryMessage: ({ data }: {
        data: any;
    }) => void;
    /** @param {Uint8Array} bytes */
    loadRhythmRom(bytes: Uint8Array): void;
    /** @param {AudioWorkletNode|MessagePort|import('./soundchip_worklet.js').WorkletSoundChip} node
     * @param {{portCount:number,chipName:string}} config */
    constructor(node: AudioWorkletNode | MessagePort | import('./soundchip_worklet.js').WorkletSoundChip, { portCount, chipName }: {
        portCount: number;
        chipName: string;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    flush(): Promise<unknown>;
    /** @param {Uint8Array} bytes
     * @param {number} [address] */
    loadAdpcmMemory(bytes: Uint8Array, address?: number): Promise<any>;
    dispose(): void;
    reset(): void;
    /** @param {number} port
     * @param {number} register
     * @param {number} value */
    write(port: number, register: number, value: number): void;
}
export declare class OPNFMSynth {
    transport: import("./ym2612synth.js").YM2612Transport;
    clock: number;
    chipName: string;
    channelCount: number;
    portCount: number;
    supportsPan: boolean;
    supportsLfo: boolean;
    hooks: {
        onWrite: undefined;
        onRead: undefined;
        onIrq: undefined;
    };
    _lastIrqState: any;
    _pendingAddressPort: any;
    _pendingAddressRegister: any;
    _modeRegister: number | undefined;
    lfo: {
        enabled: boolean;
        frequency: number;
    } | undefined;
    channels: {
        algorithm: number;
        feedback: number;
        ams: number;
        pms: number;
        left: any;
        right: any;
        block: number;
        fnum: number;
        specialFrequencies: {
            block: number;
            fnum: number;
        }[];
        operators: {
            dt: 0;
            multi: 1;
            tl: 127;
            rs: 0;
            ar: 0;
            am: false;
            d1r: 0;
            d2r: 0;
            sl: 0;
            rr: 15;
            ssg: 0;
        }[];
    }[] | undefined;
    /** @param {{transport:OPNTransport,chipName:string,channelCount:number,portCount:number,supportsPan?:boolean,supportsLfo?:boolean,clock?:number}} options */
    constructor({ transport, chipName, channelCount, portCount, clock, supportsPan, supportsLfo, }: {
        transport: OPNTransport;
        chipName: string;
        channelCount: number;
        portCount: number;
        supportsPan?: boolean;
        supportsLfo?: boolean;
        clock?: number;
    });
    reset(): void;
    /** @param {number} channel
     * @param {import('./ym2612synth.js').YM2612Preset} preset */
    setPreset(channel: number, preset: import('./ym2612synth.js').YM2612Preset): void;
    /**
     * Apply partial operator settings in order, retaining repeated entries.
     * Validate the entire batch before changing state or writing registers.
     * @param {number} channel
     * @param {Array<[number, import('./ym2612synth.js').YM2612OperatorParams]>} entries
     */
    setOperators(channel: number, entries: Array<[number, import('./ym2612synth.js').YM2612OperatorParams]>): void;
    /** @param {number} channel
     * @param {number} operator
     * @param {import('./ym2612synth.js').YM2612OperatorParams} params */
    setOperator(channel: number, operator: number, params: import('./ym2612synth.js').YM2612OperatorParams): void;
    /** @param {number} channel
     * @param {number} algorithm
     * @param {number} [feedback] */
    setAlgo(channel: number, algorithm: number, feedback?: number): void;
    /** @param {number} channel
     * @param {number} ams
     * @param {number} pms */
    setModulation(channel: number, ams: number, pms: number): void;
    /** @param {number} channel
     * @param {number} [ams]
     * @param {number} [pms] */
    /** @param {boolean} left
     * @param {boolean} right */
    setPan(channel: any, left: boolean, right: boolean, ams?: undefined, pms?: undefined): void;
    /** @param {number} frequency */
    /** @param {boolean} enabled */
    setLfo(enabled: boolean, frequency: any): void;
    /** @param {boolean} enabled */
    setChannel3SpecialMode(enabled: boolean): void;
    /** @param {number} operator
     * @param {number} block
     * @param {number} fnum */
    setChannel3SpecialFrequency(operator: number, block: number, fnum: number): void;
    /** Set frequency in Hz without KEY ON. @overload @param {number} channel @param {number} hz @returns {void} */
    /** @overload @param {number} channel @param {number} block @param {number} fnum @returns {void} */
    /** Frequency in Hz with two arguments; legacy three-argument form is raw BLOCK/F-NUM.
     * @param {number} channel @param {number} hzOrBlock @param {number} [fnum] */
    setFrequency(channel: number, hz: number): void;
    /** Set frequency in Hz without KEY ON. @overload @param {number} channel @param {number} hz @returns {void} */
    /** @overload @param {number} channel @param {number} block @param {number} fnum @returns {void} */
    /** Frequency in Hz with two arguments; legacy three-argument form is raw BLOCK/F-NUM.
     * @param {number} channel @param {number} hzOrBlock @param {number} [fnum] */
    setFrequency(channel: number, block: number, fnum: number): void;
    /** Configure a note name or integer MIDI 0..127 without triggering.
     * @param {number} channel @param {string|number} note */
    setNote(channel: number, note: string | number): void;
    /** Raw hardware pitch, without triggering. @param {number} channel @param {number} block @param {number} fnum */
    setBlockFnum(channel: number, block: number, fnum: number): void;
    /** @param {number} channel
     * @param {number[]} [operators] */
    keyOn(channel: number, operators?: number[]): void;
    /** @param {number} channel */
    keyOff(channel: number): void;
    /** Note name or integer MIDI plus KEY ON. @overload @param {number} channel @param {string|number} note @returns {void} */
    /** @overload @param {number} channel @param {number} block @param {number} fnum @returns {void} */
    /** Set a musical note and trigger. Legacy three-argument form uses raw pitch.
     * @param {number} channel @param {string|number} noteOrBlock @param {number} [fnum] */
    noteOn(channel: number, note: string | number): void;
    /** Note name or integer MIDI plus KEY ON. @overload @param {number} channel @param {string|number} note @returns {void} */
    /** @overload @param {number} channel @param {number} block @param {number} fnum @returns {void} */
    /** Set a musical note and trigger. Legacy three-argument form uses raw pitch.
     * @param {number} channel @param {string|number} noteOrBlock @param {number} [fnum] */
    noteOn(channel: number, block: number, fnum: number): void;
    /** Raw pitch plus trigger. @param {number} channel @param {number} block @param {number} fnum */
    noteOnRaw(channel: number, block: number, fnum: number): void;
    /** @param {number} channel */
    noteOff(channel: number): void;
    /** @param {number} port
     * @param {number} register
     * @param {number} value */
    write(port: number, register: number, value: number): void;
    /** @param {number} port
     * @param {number} register
     * @param {number} value */
    rawWrite(port: number, register: number, value: number): void;
    /** @param {number} port
     * @param {number} register */
    writeAddress(port: number, register: number): void;
    /** @param {number} value */
    writeData(value: number): void;
    /** @param {number} offset
     * @returns {number} Register value; zero when native reads are unavailable. */
    read(offset: number): number;
    /** @returns {number} */
    readStatus(): number;
    /** @param {import("./ym2612.js").Ym2612Hooks} [hooks] */
    setHooks({ onWrite, onRead, onIrq }?: import("./ym2612.js").Ym2612Hooks): void;
    getState(): any;
    /** @param {number} channel */
    _writeChannelPanAndModulation(channel: number): void;
    /** @param {number} channel */
    _splitChannel(channel: number): {
        port: number;
        channelOffset: number;
    };
    /** @param {number} channel */
    _assertChannel(channel: number): void;
    /** @param {number} port
     * @param {number} register */
    _write(port: number, register: number, value: any): void;
    _syncIrq(): void;
}

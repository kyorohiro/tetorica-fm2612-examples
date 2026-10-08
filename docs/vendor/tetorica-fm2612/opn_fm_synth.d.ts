/**
 * @file opn_fm_synth.js
 * 実行環境: Browser / Node.js
 * 依存: 注入されたレジスタ transport。DirectTransport は Node.js でも使用可能。
 * WorkletTransport はブラウザーの AudioWorkletNode（port）を受け取る。
 */
/**
 * Shared high-level FM register helpers for Yamaha OPN-family chips.
 *
 * The chip-specific modules configure channel/port counts and expose a
 * named public class. Keeping the register math here avoids drifting
 * YM2203 and YM2608 APIs as they grow.
 */
/**
 * Direct bus transport for `Ym2203` and `Ym2608` wrappers.
 * Their WASM API uses address/data offsets rather than a packed register
 * method, while the synth API consistently uses `write(port, reg, value)`.
 */
export declare class OPNDirectTransport {
    chip: any;
    chipName: any;
    portCount: any;
    constructor(chip: any, { chipName, portCount }: {
        chipName: any;
        portCount: any;
    });
    reset(): void;
    write(port: any, register: any, value: any): void;
    read(offset: any): any;
    readStatus(): any;
    getIrq(): any;
}
/**
 * Worklet transport shared by browser-hosted OPN chips. The worklet protocol
 * uses the same port/register/value shape as the high-level FM API.
 */
export declare class OPNWorkletTransport {
    endpoint: any;
    node: any;
    portCount: any;
    chipName: any;
    memorySequence: number;
    memoryRequests: Map<any, any>;
    disposed: boolean;
    onMemoryMessage: ({ data }: {
        data: any;
    }) => void;
    loadRhythmRom(bytes: any): void;
    constructor(node: any, { portCount, chipName }: {
        chipName: any;
        portCount: any;
    });
    start(): any;
    stop(): any;
    close(): Promise<void>;
    flush(): any;
    loadAdpcmMemory(bytes: any, address?: number): Promise<any>;
    dispose(): void;
    reset(): void;
    write(port: any, register: any, value: any): void;
}
export declare class OPNFMSynth {
    transport: any;
    chipName: any;
    channelCount: any;
    portCount: any;
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
    constructor({ transport, chipName, channelCount, portCount, supportsPan, supportsLfo, }: {
        channelCount: any;
        chipName: any;
        portCount: any;
        supportsLfo?: boolean | undefined;
        supportsPan?: boolean | undefined;
        transport: any;
    });
    reset(): void;
    setPreset(channel: any, preset: any): void;
    /**
     * Apply partial operator settings in order, retaining repeated entries.
     * Validate the entire batch before changing state or writing registers.
     * @param {number} channel
     * @param {Array<[number, import('./ym2612synth.js').YM2612OperatorParams]>} entries
     */
    setOperators(channel: number, entries: Array<[number, import('./ym2612synth.js').YM2612OperatorParams]>): void;
    setOperator(channel: any, operator: any, params: any): void;
    setAlgo(channel: any, algorithm: any, feedback?: number): void;
    setModulation(channel: any, ams: any, pms: any): void;
    setPan(channel: any, left: any, right: any, ams?: undefined, pms?: undefined): void;
    setLfo(enabled: any, frequency: any): void;
    setChannel3SpecialMode(enabled: any): void;
    setChannel3SpecialFrequency(operator: any, block: any, fnum: any): void;
    setFrequency(channel: any, block: any, fnum: any): void;
    keyOn(channel: any, operators?: undefined): void;
    keyOff(channel: any): void;
    noteOn(channel: any, block: any, fnum: any): void;
    noteOff(channel: any): void;
    write(port: any, register: any, value: any): void;
    rawWrite(port: any, register: any, value: any): void;
    writeAddress(port: any, register: any): void;
    writeData(value: any): void;
    read(offset: any): any;
    readStatus(): any;
    /** @param {import("./ym2612.js").Ym2612Hooks} [hooks] */
    setHooks({ onWrite, onRead, onIrq }?: import("./ym2612.js").Ym2612Hooks): void;
    getState(): any;
    _writeChannelPanAndModulation(channel: any): void;
    _splitChannel(channel: any): {
        port: number;
        channelOffset: any;
    };
    _assertChannel(channel: any): void;
    _write(port: any, register: any, value: any): void;
    _syncIrq(): void;
}

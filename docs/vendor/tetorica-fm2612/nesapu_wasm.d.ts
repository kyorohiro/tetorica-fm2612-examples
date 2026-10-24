export declare class NesApuWasm {
    backend: string;
    module: any;
    handle: any;
    api: any;
    clock: any;
    rate: any;
    fdsEnabled: any;
    ptr: number;
    capacity: number;
    uploadPtr: number;
    uploadCapacity: number;
    buffer: any;
    views: Map<any, any>;
    muteMask: number;
    offsets: any[];
    stateSize: any;
    statePtr: any;
    stateView: DataView<any> | undefined;
    /** @param {import('./soundchip.js').SoundChipOptions} [options] */
    static create(options?: import('./soundchip.js').SoundChipOptions): Promise<NesApuWasm>;
    constructor(module: any, handle: any, api: any, { clock, sampleRate, fds }: {
        clock: any;
        fds: any;
        sampleRate: any;
    });
    check(): void;
    refreshViews(): void;
    snapshot(): DataView<any> | undefined;
    get enableMask(): number;
    /** Applied state, copied once for observation. Reading never advances audio. */
    getState(): {
        backend: string;
        registers: number[];
        wave: number[];
        modulation: number[];
        periods: number[];
        lengths: number[];
        volumes: number[];
        dmcAddress: number;
        dmcRemaining: number;
        dmcOutput: number;
        dmcFrequency: number;
        fdsFrequency: number;
        fdsModFrequency: number;
        fdsModIndex: number;
        fdsModClock: number;
        fdsModCounter: number;
        fdsGain: number;
        fdsSweepGain: number;
        fdsMaster: number;
        fdsAccumulator: number;
        fdsOutput: number;
        enableMask: number;
        muteMask: number;
        fdsEnabled: boolean;
        fdsIo: boolean;
        fdsActive: boolean;
        fdsWriteEnabled: boolean;
        fdsModEnabled: boolean;
        frameIrq: boolean;
        dmcIrq: boolean;
        clock: number;
        baseClock: number;
    };
    writeRegister(register: any, value: any): void;
    setChannelEnabled(channel: any, enabled: any): void;
    loadMemory(bytes: any, address?: number): void;
    readMemory(address: any): any;
    reset(): void;
    sampleRate(): any;
    setChannelMuted(channel: any, muted: any): void;
    reserveStereoFrames(frames: any): void;
    pcmView(frames: any): any;
    /** Scratch PCM remains valid until another generation, resize or disposal. */
    generateStereoView(frames: any): any;
    /** Returned copies survive later generation, buffer growth and disposal. */
    generateStereo(frames: any): {
        left: any;
        right: any;
    };
    dispose(): void;
}

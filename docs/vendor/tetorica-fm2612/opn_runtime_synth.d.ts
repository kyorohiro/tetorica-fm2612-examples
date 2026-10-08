/**
 * Browser lifecycle wrapper for an OPN FM synth. Chip-specific subclasses
 * provide their worklet protocol and high-level FM constructor.
 */
export declare class OPNRuntimeSynth {
    #private;
    chip: any;
    capabilities: Readonly<{
        chip: any;
        fmChannels: any;
        psg: false;
        dac: false;
        recorder: false;
    }>;
    audio: any;
    workletUrl: any;
    wasmUrl: any;
    processorName: any;
    chipName: any;
    portCount: any;
    FMSynth: any;
    rhythmRom: any;
    rhythmRomUrl: any;
    mixerRelease: (() => void) | null;
    node: AudioWorkletNode | null;
    fm: any;
    psg: any;
    listeners: Set<any>;
    readyPromise: Promise<void> | null;
    closePromise: Promise<void> | null;
    initializationController: AbortController | null;
    state: string;
    noise: any;
    constructor(options: {} | undefined, config: any);
    /** @returns {import('./soundchip_mixer.js').SoundChipMixer} */
    get mixer(): import('./soundchip_mixer.js').SoundChipMixer;
    get audioContext(): any;
    set audioContext(value: any);
    get ownsAudioContext(): any;
    get sample(): any;
    get stream(): any;
    start(): Promise<this>;
    resume(): Promise<void>;
    suspend(): Promise<void>;
    reset(): void;
    isReady(): boolean;
    isStarting(): boolean;
    addListener(listener: any): () => boolean;
    removeListener(listener: any): void;
    setMasterVolume(volume: any): any;
    getMasterVolume(): any;
    setFXChain(effects?: any[], options?: {}): any;
    getFXChain(): any;
    clearFXChain(options?: {}): any;
    connect(effect: any): this;
    connectOutput(node?: null): this;
    close(): Promise<void>;
}

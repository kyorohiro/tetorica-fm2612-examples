/**
 * @file opn_runtime_synth.js
 * 実行環境: Browser（メインスレッド）
 * 依存: 音声初期化・再生時に AudioContext / AudioWorkletNode と WASM アセットが必要。
 * import だけでは音声デバイスを開かない。アセット読み込みには fetch を使用する。
 */
import { TetoricaAudioRuntime } from "./tetorica_audio_runtime.js";
export type OPNRuntimeSynthOptions = Pick<import('./megasynth.js').MegaSynthOptions, 'audioContext' | 'outputNode' | 'sampleOutputNode' | 'masterVolume' | 'mixer' | 'workletUrl'> & {
    wasmUrl?: string;
    rhythmRom?: Uint8Array;
    rhythmRomUrl?: string;
};
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
    audio: TetoricaAudioRuntime;
    workletUrl: any;
    wasmUrl: any;
    processorName: any;
    chipName: any;
    portCount: any;
    FMSynth: any;
    rhythmRom: Uint8Array<ArrayBufferLike> | undefined;
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
    noise: {
        create: (options?: {}) => any;
        stopAll: () => void;
    };
    /** @param {OPNRuntimeSynthOptions|undefined} options */
    constructor(options: OPNRuntimeSynthOptions | undefined, config: any);
    /** @returns {import('./soundchip_mixer.js').SoundChipMixer} */
    get mixer(): import('./soundchip_mixer.js').SoundChipMixer;
    get audioContext(): AudioContext | null;
    set audioContext(value: AudioContext | null);
    get ownsAudioContext(): boolean;
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
    /** @param {number} volume */
    setMasterVolume(volume: number): number;
    getMasterVolume(): number;
    setFXChain(effects?: any[], options?: {}): any;
    getFXChain(): any;
    clearFXChain(options?: {}): any;
    connect(effect: any): this;
    connectOutput(node?: null): this;
    close(): Promise<void>;
}

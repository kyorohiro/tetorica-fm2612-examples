/**
 * @file gameboy_runtime_synth.js
 * 実行環境: Browser（メインスレッド）
 * 依存: 音声初期化・再生時に AudioContext / AudioWorkletNode と WASM アセットが必要。
 * import だけでは音声デバイスを開かない。アセット読み込みには fetch を使用する。
 */
import { TetoricaAudioRuntime } from "./tetorica_audio_runtime.js";
import { GameboySynth } from "./gameboysynth.js";
export type GameboyRuntimeSynthOptions = Pick<import('./megasynth.js').MegaSynthOptions, 'audioContext' | 'outputNode' | 'sampleOutputNode' | 'masterVolume' | 'mixer' | 'workletUrl'> & {
    wasmUrl?: string;
};
/**
 * Browser lifecycle and shared mixer/media/FX services for the primary Game Boy APU.
 */
export declare class GameboyRuntimeSynth {
    #private;
    chip: string;
    capabilities: Readonly<{
        chip: string;
        fmChannels: number;
        psg: false;
        dac: false;
        recorder: false;
    }>;
    audio: TetoricaAudioRuntime;
    workletUrl: string | URL;
    wasmUrl: string | URL;
    processorName: string;
    chipName: string;
    mixerRelease: (() => void) | null;
    node: AudioWorkletNode | null;
    fm: any;
    gameboy: GameboySynth | null;
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
    /** @param {GameboyRuntimeSynthOptions|undefined} options */
    constructor(options?: GameboyRuntimeSynthOptions | undefined);
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

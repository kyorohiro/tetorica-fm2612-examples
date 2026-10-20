import { SoundChipMixer } from './soundchip_mixer.js';
/**
 * Chip-independent browser audio state shared by Tetorica synths.
 *
 * Routing behavior is migrated here incrementally; this first version owns
 * the mutable state so chip synths can compose it without changing callers.
 */
export declare class TetoricaAudioRuntime {
    ownsAudioContext: boolean;
    audioContext: AudioContext | null;
    outputNode: AudioNode | null;
    sampleOutputNode: AudioNode | null;
    masterVolume: number;
    listeningVolume: number;
    /** @type {SoundChipMixer} */
    mixer: SoundChipMixer;
    masterInputNode: GainNode | null;
    masterOutputNode: GainNode | null;
    /** @type {Set<AudioNode>} Non-audible observation branches after FX and master volume. */
    outputMonitors: Set<AudioNode>;
    fxChain: any[];
    nativeFXPreparation: any;
    nativeFXGeneration: number;
    sampleBuffers: Map<any, any>;
    sampleVoices: Set<any>;
    streamEntries: Map<any, any>;
    noiseVoices: Set<any>;
    audioHandles: Map<any, any>;
    sample: any;
    stream: any;
    noise: {
        create: (options?: {}) => any;
        stopAll: () => void;
    } | null;
    nativeFX: any;
    /** @param {{audioContext?:AudioContext|null,outputNode?:AudioNode|null,sampleOutputNode?:AudioNode|null,masterVolume?:number,mixer?:SoundChipMixer}} [options] */
    constructor(options?: {
        audioContext?: AudioContext | null;
        outputNode?: AudioNode | null;
        sampleOutputNode?: AudioNode | null;
        masterVolume?: number;
        mixer?: SoundChipMixer;
    });
    setMediaApis(sample: any, stream: any): void;
    /** @param {string} name */
    stopSample(name: string): void;
    /** @param {string} name */
    unloadSample(name: string): boolean;
    /** @param {string} name
     * @param {AudioBuffer} buffer */
    storeSample(name: string, buffer: AudioBuffer): AudioBuffer;
    /** @param {string} name */
    getSample(name: string): any;
    /** @param {string} name */
    hasSample(name: string): boolean;
    listSamples(): any[];
    createSampleApi(options?: {}): {
        load: (name: any, source: any) => Promise<any>;
        play: (name: any, playOptions?: {}) => Promise<any> | {
            name: string;
            source: AudioBufferSourceNode;
            gainNode: GainNode;
            pannerNode: GainNode | StereoPannerNode;
            stop: () => void;
        };
        stop: (name: any) => void;
        stopAll: () => void;
        unload: (name: any) => boolean;
        isLoaded: (name: any) => boolean;
        get: (name: any) => any;
        list: () => any[];
    };
    createStreamApi(options?: {}): {
        load: (name: any, url: any) => Promise<{
            name: string;
            element: HTMLAudioElement;
            sourceNode: any;
            gainNode: any;
            pannerNode: any;
            play: (playOptions?: {}) => Promise<void>;
            pause: () => void;
            stop: () => void;
        }>;
        play: (name: any, playOptions?: {}) => Promise<any>;
        pause: (name: any) => void;
        stop: (name: any) => void;
        unload: (name: any) => boolean;
        isLoaded: (name: any) => boolean;
        get: (name: any) => any;
        list: () => any[];
    };
    createNoiseApi(): {
        create: (options?: {}) => any;
        stopAll: () => void;
    };
    prepareNativeFX(): Promise<any>;
    createFXApi(options?: {}): any;
    setAudioHandle(id: any, value: any): any;
    getAudioHandle(id: any): any;
    disposeAudioHandle(id: any): void;
    disposeAudioHandles(ids?: MapIterator<any>): void;
    createNoiseVoice(options?: {}): any;
    stopNoise(): void;
    disposeNoise(): void;
    mediaOutputNode(): AudioNode;
    loadSample(name: any, source: any, options?: {}): Promise<any>;
    playSample(name: any, options?: {}): Promise<any> | {
        name: string;
        source: AudioBufferSourceNode;
        gainNode: GainNode;
        pannerNode: GainNode | StereoPannerNode;
        stop: () => void;
    };
    loadStream(name: any, url: any, options?: {}): Promise<{
        name: string;
        element: HTMLAudioElement;
        sourceNode: any;
        gainNode: any;
        pannerNode: any;
        play: (playOptions?: {}) => Promise<void>;
        pause: () => void;
        stop: () => void;
    }>;
    playStream(name: any, options?: {}, runtimeOptions?: {}): Promise<any>;
    playLoadedStream(entry: any, options?: {}, runtimeOptions?: {}): Promise<void>;
    /** @param {string} name */
    pauseStream(name: string): void;
    /** @param {string} name */
    stopStream(name: string): void;
    /** @param {string} name */
    unloadStream(name: string): boolean;
    /** @param {AudioContext} audioContext */
    ensureRouting(audioContext: AudioContext): void;
    /** @param {AudioNode} node */
    connectChipOutput(node: AudioNode): void;
    setFXChain(effects?: any[], options?: {}): any;
    getFXChain(): any;
    connect(effect: any): void;
    clearFXChain(options?: {}): any;
    disposeFXChain(): void;
    /** @param {AudioNode|null} [node] */
    connectOutput(node?: AudioNode | null): void;
    /**
     * Observe the mixed output without changing its destination. Reconnected after FX changes.
     * @param {AudioNode} node Observation input in this runtime's AudioContext.
     * @returns {() => void} Disconnect this observation branch.
     */
    connectOutputMonitor(node: AudioNode): () => void;
    /** @param {number} volume Requested gain; running output approaches it with a 1 ms time constant (~99.3% in 5 ms). */
    setMasterVolume(volume: number): number;
    /** Host playback level (0..8), retained when scripts set their master gain.
     * The final output and its monitors include both gains. @param {number} volume */
    setListeningVolume(volume: number): number;
    disconnectRouting(): void;
    closeMedia(): void;
    rebuildFXChain(): void;
}

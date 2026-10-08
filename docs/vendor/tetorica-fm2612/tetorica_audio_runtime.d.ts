import { SoundChipMixer } from './soundchip_mixer.js';
import * as fx from "./megasynth_fx.js";
/**
 * Chip-independent browser audio state shared by Tetorica synths.
 *
 * Routing behavior is migrated here incrementally; this first version owns
 * the mutable state so chip synths can compose it without changing callers.
 */
export declare class TetoricaAudioRuntime {
    ownsAudioContext: boolean;
    audioContext: any;
    outputNode: any;
    sampleOutputNode: any;
    masterVolume: any;
    /** @type {SoundChipMixer} */
    mixer: SoundChipMixer;
    masterInputNode: any;
    masterOutputNode: any;
    fxChain: any[];
    sampleBuffers: Map<any, any>;
    sampleVoices: Set<any>;
    streamEntries: Map<any, any>;
    noiseVoices: Set<any>;
    audioHandles: Map<any, any>;
    sample: any;
    stream: any;
    noise: {
        create: (options?: {}) => {
            type: any;
            gain: any;
            pan: any;
            attack: any;
            release: any;
            filter: {
                cutoff: any;
                q: any;
                set(mode: any, frequency: any, q?: any): void;
            };
            start: () => void;
            stop: () => void;
            dispose(): void;
        };
        stopAll: () => void;
    } | null;
    nativeFX: {
        node: AudioWorkletNode;
        controller: {
            liveFx(name: string, { process, context, resetState }?: {
                process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
                context?: Record<string, unknown>;
                resetState?: boolean;
            }): void;
            updateContext(name: any, context: any): void;
            removeLiveFx(name: any): void;
            branch: (...children: any[]) => {
                type: string;
                children: any[];
                owner: /*elided*/ any;
                dispose(): void;
            };
            parallel: (...children: any[]) => {
                type: string;
                children: any[];
                owner: /*elided*/ any;
                dispose(): void;
            };
            setChain(effects?: any[]): any[];
            clear({ dispose }?: {
                dispose?: boolean | undefined;
            }): any[];
            dispose(): void;
            getChain(): any[];
            syncTempo(): void;
        };
        mainActive: boolean;
        sample: {
            accept(d: any): void;
            load(name: any, pcm: any): Promise<{
                name: any;
                length: any;
                sampleRate: any;
                numberOfChannels: any;
                duration: number;
            }>;
            play(name: any, options?: {}): Promise<{
                name: any;
                stop: () => any;
            }>;
            stop(name: any): void;
            stopAll(): void;
            unload(name: any): boolean;
            isLoaded: (name: any) => boolean;
            get: (name: any) => any;
            list: () => any[];
            invalidate(): void;
        };
        noise: {
            create(options?: {}): {
                type: any;
                gain: any;
                pan: any;
                attack: any;
                release: any;
                filter: {
                    cutoff: any;
                    q: any;
                    set(mode: any, frequency: any, q?: any): void;
                };
                start: () => void;
                stop: () => void;
                dispose(): void;
            };
            stopAll(): void;
            disposeAll(): void;
        };
        getBeatSeconds: () => number;
        useMain(): void;
        workerPort(): MessagePort;
        stop(): void;
        dispose(): void;
    } | null | undefined;
    constructor(options?: {});
    setMediaApis(sample: any, stream: any): void;
    stopSample(name: any): void;
    unloadSample(name: any): boolean;
    storeSample(name: any, buffer: any): any;
    getSample(name: any): any;
    hasSample(name: any): boolean;
    listSamples(): any[];
    createSampleApi(options?: {}): {
        load: (name: any, source: any) => Promise<any>;
        play: (name: any, playOptions?: {}) => Promise<{
            name: any;
            stop: () => any;
        }> | {
            name: string;
            source: any;
            gainNode: any;
            pannerNode: any;
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
        create: (options?: {}) => {
            type: any;
            gain: any;
            pan: any;
            attack: any;
            release: any;
            filter: {
                cutoff: any;
                q: any;
                set(mode: any, frequency: any, q?: any): void;
            };
            start: () => void;
            stop: () => void;
            dispose(): void;
        };
        stopAll: () => void;
    };
    prepareNativeFX(): Promise<{
        node: AudioWorkletNode;
        controller: {
            liveFx(name: string, { process, context, resetState }?: {
                process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
                context?: Record<string, unknown>;
                resetState?: boolean;
            }): void;
            updateContext(name: any, context: any): void;
            removeLiveFx(name: any): void;
            branch: (...children: any[]) => {
                type: string;
                children: any[];
                owner: /*elided*/ any;
                dispose(): void;
            };
            parallel: (...children: any[]) => {
                type: string;
                children: any[];
                owner: /*elided*/ any;
                dispose(): void;
            };
            setChain(effects?: any[]): any[];
            clear({ dispose }?: {
                dispose?: boolean | undefined;
            }): any[];
            dispose(): void;
            getChain(): any[];
            syncTempo(): void;
        };
        mainActive: boolean;
        sample: {
            accept(d: any): void;
            load(name: any, pcm: any): Promise<{
                name: any;
                length: any;
                sampleRate: any;
                numberOfChannels: any;
                duration: number;
            }>;
            play(name: any, options?: {}): Promise<{
                name: any;
                stop: () => any;
            }>;
            stop(name: any): void;
            stopAll(): void;
            unload(name: any): boolean;
            isLoaded: (name: any) => boolean;
            get: (name: any) => any;
            list: () => any[];
            invalidate(): void;
        };
        noise: {
            create(options?: {}): {
                type: any;
                gain: any;
                pan: any;
                attack: any;
                release: any;
                filter: {
                    cutoff: any;
                    q: any;
                    set(mode: any, frequency: any, q?: any): void;
                };
                start: () => void;
                stop: () => void;
                dispose(): void;
            };
            stopAll(): void;
            disposeAll(): void;
        };
        getBeatSeconds: () => number;
        useMain(): void;
        workerPort(): MessagePort;
        stop(): void;
        dispose(): void;
    }>;
    createFXApi(options?: {}): {
        liveFx(name: string, { process, context, resetState }?: {
            process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
            context?: Record<string, unknown>;
            resetState?: boolean;
        }): void;
        updateContext(name: any, context: any): void;
        removeLiveFx(name: any): void;
        branch: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        parallel: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        setChain(effects?: any[]): any[];
        clear({ dispose }?: {
            dispose?: boolean | undefined;
        }): any[];
        dispose(): void;
        getChain(): any[];
        syncTempo(): void;
    } | {
        gain: (fxOptions?: {}) => fx.GainFXUnit;
        eq: (fxOptions?: {}) => fx.EqFXUnit;
        radioTone: (fxOptions?: {}) => fx.RadioToneFXUnit;
        lofi: (fxOptions?: {}) => fx.LofiFXUnit;
        stereoWidth: (fxOptions?: {}) => fx.StereoWidthFXUnit;
        bitcrusher: (fxOptions?: {}) => fx.BitcrusherFXUnit;
        filter: (fxOptions?: {}) => fx.FilterFXUnit;
        delay: (fxOptions?: {}) => fx.DelayFXUnit;
        distortion: (fxOptions?: {}) => fx.DistortionFXUnit;
        compressor: (fxOptions?: {}) => fx.CompressorFXUnit;
        gate: (fxOptions?: {}) => fx.GateFXUnit;
        wobble: (fxOptions?: {}) => fx.WobbleFXUnit;
        flanger: (fxOptions?: {}) => fx.FlangerFXUnit;
        chorus: (fxOptions?: {}) => fx.ChorusFXUnit;
        tapeSaturation: (fxOptions?: {}) => fx.TapeSaturationFXUnit;
        reverb: (fxOptions?: {}) => fx.ReverbFXUnit;
        branch: (...effects: any[]) => fx.FXBranch;
        parallel: (...branches: any[]) => fx.ParallelFXUnit;
        slicer: (fxOptions?: {}) => fx.SlicerFXUnit;
        setChain: (effects?: any[]) => any[];
        clear: (fxOptions?: {}) => any[];
    };
    setAudioHandle(id: any, value: any): any;
    getAudioHandle(id: any): any;
    disposeAudioHandle(id: any): void;
    disposeAudioHandles(ids?: MapIterator<any>): void;
    createNoiseVoice(options?: {}): {
        type: any;
        gain: any;
        pan: any;
        attack: any;
        release: any;
        filter: {
            cutoff: any;
            q: any;
            set(mode: any, frequency: any, q?: any): void;
        };
        start: () => void;
        stop: () => void;
        dispose(): void;
    };
    stopNoise(): void;
    disposeNoise(): void;
    mediaOutputNode(): any;
    loadSample(name: any, source: any, options?: {}): Promise<any>;
    playSample(name: any, options?: {}): Promise<{
        name: any;
        stop: () => any;
    }> | {
        name: string;
        source: any;
        gainNode: any;
        pannerNode: any;
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
    pauseStream(name: any): void;
    stopStream(name: any): void;
    unloadStream(name: any): boolean;
    ensureRouting(audioContext: any): void;
    connectChipOutput(node: any): void;
    setFXChain(effects?: any[], options?: {}): any[] | undefined;
    getFXChain(): any[];
    connect(effect: any): void;
    clearFXChain(options?: {}): any[];
    disposeFXChain(): void;
    connectOutput(node?: null): void;
    setMasterVolume(volume: any): any;
    disconnectRouting(): void;
    closeMedia(): void;
    rebuildFXChain(): void;
}

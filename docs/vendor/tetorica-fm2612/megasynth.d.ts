/**
 * @file megasynth.js
 * 実行環境: Browser（メインスレッド）
 * 依存: 音声初期化・再生時に AudioContext / AudioWorkletNode と WASM アセットが必要。
 * import だけでは音声デバイスを開かない。アセット読み込みには fetch を使用する。
 */
import { MegaSynthRecordingManager } from "./megasynth_recording.js";
import { createSegaPsgApi } from "./segapsg_api.js";
import { createRf5c164Client } from "./playground_rf5c164.js";
export { createFXBranch, createBitcrusherFX, createChorusFX, createFXParallel, createDelayFX, createEqFX, createFilterFX, createGainFX, createLofiFX, createRadioToneFX, createReverbFX, createSlicerFX, createStereoWidthFX, createTapeSaturationFX, } from "./megasynth_fx.js";
export { MegaSynthLooper } from "./looper.js";
export { FM_PRESETS, FM_PRESET_ORDER, } from "./megasynth-fm-presets.js";
export type AnyFXUnit = import("./megasynth_fx.js").AnyFXUnit;
export type YM2612SynthType = import("./ym2612synth.js").YM2612Synth;
export type YM2612Transport = import("./ym2612synth.js").YM2612Transport;
export type MegaSynthSamplePlayOptions = {
    gain?: number;
    playbackRate?: number;
    offset?: number;
    duration?: number;
    loop?: boolean;
    loopStart?: number;
    loopEnd?: number;
    fadeIn?: number;
    fadeOut?: number;
    pan?: number;
};
export type MegaSynthSampleVoice = {
    name: string;
    source: AudioBufferSourceNode;
    gainNode: GainNode;
    pannerNode: StereoPannerNode | GainNode;
    stop(): void;
};
export type MegaSynthSampleAPI = {
    load(name: string, source: string | ArrayBuffer | AudioBuffer): Promise<AudioBuffer>;
    play(name: string, options?: MegaSynthSamplePlayOptions): MegaSynthSampleVoice | Promise<MegaSynthSampleVoice>;
    stop(name?: string): void;
    stopAll(): void;
    unload(name: string): boolean;
    isLoaded(name: string): boolean;
    get(name: string): AudioBuffer | null;
    list(): string[];
};
export type MegaSynthStreamPlayOptions = {
    gain?: number;
    playbackRate?: number;
    offset?: number;
    loop?: boolean;
    fadeIn?: number;
    fadeOut?: number;
    pan?: number;
};
export type MegaSynthStreamEntry = {
    name: string;
    element: HTMLAudioElement;
    sourceNode: MediaElementAudioSourceNode;
    gainNode: GainNode;
    pannerNode: StereoPannerNode | GainNode;
    play(options?: MegaSynthStreamPlayOptions): Promise<void>;
    pause(): void;
    stop(): void;
};
export type MegaSynthStreamAPI = {
    load(name: string, url: string): Promise<MegaSynthStreamEntry>;
    play(name: string, options?: MegaSynthStreamPlayOptions): Promise<MegaSynthStreamEntry>;
    pause(name?: string): void;
    stop(name?: string): void;
    unload(name: string): boolean;
    isLoaded(name: string): boolean;
    get(name: string): MegaSynthStreamEntry | null;
    list(): string[];
};
export type MegaSynthOptions = {
    audioContext?: AudioContext | null;
    outputNode?: AudioNode | null;
    workletUrl?: string;
    stereoWidthWorkletUrl?: string;
    bitcrusherWorkletUrl?: string;
    ym2612WasmUrl?: string;
    segaPsgWasmUrl?: string | null;
    megaCD?: boolean;
    mega32X?: boolean;
    pwmOptions?: {
        clock?: number;
        gain?: number;
        outputMode?: "duty" | "dac";
    };
    rf5c164WasmUrl?: string;
    rf5c164WorkletUrl?: string;
    rf5c164Fetch?: typeof fetch;
    chipSampleRate?: number;
    mixer?: import('./soundchip_mixer.js').SoundChipMixer;
    masterVolume?: number;
    sampleOutputNode?: AudioNode | null;
};
export type FXChainOptions = {
    dispose?: boolean;
};
export type MegaSynthEvent = {
    type: "reset";
} | {
    type: "setPreset";
    channel: number;
    preset: object;
} | {
    type: "setOperator";
    channel: number;
    operator: number;
    params: object;
} | {
    type: "setAlgo";
    channel: number;
    algorithm: number;
    feedback: number;
} | {
    type: "setPan";
    channel: number;
    left: boolean;
    right: boolean;
} | {
    type: "setChannel3SpecialMode";
    enabled: boolean;
} | {
    type: "setChannel3SpecialFrequency";
    operator: number;
    block: number;
    fnum: number;
} | {
    type: "setDacEnabled";
    enabled: boolean;
} | {
    type: "writeDac";
    value: number;
} | {
    type: "noteOn";
    channel: number;
    block: number;
    fnum: number;
} | {
    type: "noteOff";
    channel: number;
} | {
    type: "setMasterVolume";
    volume: number;
};
export type MegaSynthListener = (event: MegaSynthEvent) => void;
/**
 * @typedef {{
 *   dispose?: boolean,
 * }} FXChainOptions
 */
/**
 * @typedef {{
 *   type: "reset",
 * } | {
 *   type: "setPreset",
 *   channel: number,
 *   preset: object,
 * } | {
 *   type: "setOperator",
 *   channel: number,
 *   operator: number,
 *   params: object,
 * } | {
 *   type: "setAlgo",
 *   channel: number,
 *   algorithm: number,
 *   feedback: number,
 * } | {
 *   type: "setPan",
 *   channel: number,
 *   left: boolean,
 *   right: boolean,
 * } | {
 *   type: "setChannel3SpecialMode",
 *   enabled: boolean,
 * } | {
 *   type: "setChannel3SpecialFrequency",
 *   operator: number,
 *   block: number,
 *   fnum: number,
 * } | {
 *   type: "setDacEnabled",
 *   enabled: boolean,
 * } | {
 *   type: "writeDac",
 *   value: number,
 * } | {
 *   type: "noteOn",
 *   channel: number,
 *   block: number,
 *   fnum: number,
 * } | {
 *   type: "noteOff",
 *   channel: number,
 * } | {
 *   type: "setMasterVolume",
 *   volume: number,
 * }} MegaSynthEvent
 */
/**
 * @callback MegaSynthListener
 * @param {MegaSynthEvent} event
 * @returns {void}
 */
/**
 * Browser-side Mega / Genesis-oriented synth runtime.
 *
 * This class hides:
 *
 * - AudioContext
 * - AudioWorkletNode
 * - YM2612 WASM loading
 * - AudioWorklet initialization
 *
 * The YM2612 control API itself is exposed through `fm`.
 *
 * Future:
 *
 * - Sega PSG
 * - DAC helpers
 * - sample-timed scheduling
 * - VGM playback
 */
export declare class MegaSynth {
    #private;
    audio: any;
    mixerReleases: any[];
    workletUrl: string;
    stereoWidthWorkletUrl: string;
    bitcrusherWorkletUrl: string;
    ym2612WasmUrl: string;
    chipSampleRate: number;
    /**
     * Optional. When set, the worklet also loads a Sega PSG core and mixes
     * it with the YM2612 output, exposed on `this.psg`. Left unset by
     * default except in Mega CD mode, so FM-only callers are unaffected.
     */
    megaCD: boolean;
    mega32X: boolean;
    pwmOptions: {
        clock?: number;
        gain?: number;
        outputMode?: "duty" | "dac";
    };
    /** @type {(import("./pwm32x_playback.js").AsyncPWMAPI & {dispose(): void, readonly id: string}) | null} */
    pwm: (import("./pwm32x_playback.js").AsyncPWMAPI & {
        dispose(): void;
        readonly id: string;
    }) | null;
    pwmDevice: {
        node: AudioWorkletNode;
        port: MessagePort;
        dispose(): void;
    } | null;
    segaPsgWasmUrl: string | null;
    rf5c164WasmUrl: string;
    rf5c164WorkletUrl: string;
    rf5c164Fetch: typeof fetch | undefined;
    /** RF5C164 API after start() when megaCD is enabled; its methods return promises.
     * @type {(ReturnType<typeof createRf5c164Client> & {readonly id: string}) | null} */
    pcm: (ReturnType<typeof createRf5c164Client> & {
        readonly id: string;
    }) | null;
    pcmDevice: {
        node: AudioWorkletNode;
        port: MessagePort;
        dispose: () => void;
    } | null;
    pcmDecodeId: number;
    node: AudioWorkletNode | null;
    recordingManager: MegaSynthRecordingManager | null;
    _recordingHooksInstalled: boolean;
    listeners: Set<any>;
    /** @type {(YM2612SynthType & {readonly id: string}) | null} */
    fm: (YM2612SynthType & {
        readonly id: string;
    }) | null;
    /** @type {(ReturnType<typeof createSegaPsgApi> & {readonly id: string}) | null} */
    psg: (ReturnType<typeof createSegaPsgApi> & {
        readonly id: string;
    }) | null;
    noise: any;
    /** @type {Promise<void> | null} */
    readyPromise: Promise<void> | null;
    closePromise: Promise<void> | null;
    initializationController: AbortController | null;
    /** @type {"idle" | "starting" | "ready" | "error" | "closed"} */
    state: "idle" | "starting" | "ready" | "error" | "closed";
    masterInputNode: any;
    masterOutputNode: any;
    audioContext: AudioContext | null | undefined;
    /**
     * @param {MegaSynthOptions} [options]
     */
    constructor(options?: MegaSynthOptions);
    /**
     * Initialize and start the browser audio runtime.
     *
     * This should normally be called from a user gesture such as
     * a click, pointerdown, or keydown event.
     *
     * Calling close() during initialization rejects start() with AbortError.
     *
     * @returns {Promise<MegaSynth>}
     */
    start(): Promise<MegaSynth>;
    get sample(): any;
    get stream(): any;
    /**
     * @returns {Promise<void>}
     */
    resume(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    suspend(): Promise<void>;
    /**
     * @returns {Promise<void>|undefined} Await to also reset Mega CD PCM.
     */
    reset(): Promise<void> | undefined;
    /**
     * Subscribe to high-level FM actions coming from `fm`.
     *
     * This stays on `MegaSynth` so UI/demo sync logic does not have to live
     * inside the lower-level `YM2612Synth`.
     *
     * @param {MegaSynthListener} listener
     * @returns {() => void}
     */
    addListener(listener: MegaSynthListener): () => void;
    /**
     * @param {MegaSynthListener} listener
     * @returns {void}
     */
    removeListener(listener: MegaSynthListener): void;
    /**
     * @param {AnyFXUnit[]} [effects]
     * @param {FXChainOptions} [options]
     * @returns {void}
     */
    setFXChain(effects?: AnyFXUnit[], options?: FXChainOptions): void;
    /**
     * @returns {AnyFXUnit[]}
     */
    getFXChain(): AnyFXUnit[];
    /**
     * @param {AnyFXUnit} effect
     * @returns {MegaSynth}
     */
    connect(effect: AnyFXUnit): MegaSynth;
    /**
     * @param {FXChainOptions} [options]
     * @returns {AnyFXUnit[]}
     */
    clearFXChain(options?: FXChainOptions): AnyFXUnit[];
    /**
     * @param {AudioNode | null} [node]
     * @returns {MegaSynth}
     */
    connectOutput(node?: AudioNode | null): MegaSynth;
    /**
     * Set the final browser-side output gain after the current FX chain.
     *
     * This is not a YM2612 register write. It scales the mixed output at the
     * Web Audio level.
     *
     * @param {number} volume
     * @returns {number}
     */
    setMasterVolume(volume: number): number;
    /**
     * @returns {number}
     */
    getMasterVolume(): number;
    /**
     * @returns {*}
     */
    startRecord(): any;
    /**
     * @returns {*}
     */
    stopRecord(): any;
    /**
     * @returns {*}
     */
    exportRecording(): any;
    /**
     * @param {*} recording
     * @returns {*}
     */
    importRecording(recording: any): any;
    /**
     * @param {*} [recording=null]
     * @param {object} [options={}]
     * @returns {*}
     */
    playRecording(recording?: any, options?: object): any;
    /**
     * @returns {void}
     */
    stopRecordingPlayback(): void;
    /**
     * @returns {boolean}
     */
    isRecording(): boolean;
    /**
     * @returns {boolean}
     */
    isRecordingPlaybackActive(): boolean;
    /**
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * @returns {boolean}
     */
    isReady(): boolean;
    /**
     * @returns {boolean}
     */
    isStarting(): boolean;
    /** @returns {import('./soundchip_mixer.js').SoundChipMixer} */
    get mixer(): import('./soundchip_mixer.js').SoundChipMixer;
    releaseMixerSources(): void;
}
export declare const MegaDriveSynth: typeof MegaSynth;

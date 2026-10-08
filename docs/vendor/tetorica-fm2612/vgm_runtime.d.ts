/**
 * @file vgm_runtime.js
 * 実行環境: Browser（メインスレッド）
 * 依存: 音声初期化・再生時に AudioContext / AudioWorkletNode と WASM アセットが必要。
 * import だけでは音声デバイスを開かない。アセット読み込みには fetch を使用する。
 */
import ym2612ModuleFactory from "./generated/ym2612_wasm.js";
import segaPsgModuleFactory from "./generated/segapsg_wasm.js";
import { VgmPlayer } from "./vgmplayer.js";
export type VgmRuntimeState = {
    audio: "idle" | "preparing" | "ready" | "error";
    playback: "stopped" | "playing" | "paused";
    hasBuffer: boolean;
    loopEnabled: boolean;
    queuedFrames: number;
    processedEvents: number;
    processedWaitSamples: number;
    totalSamples: number;
    audioProgress: number;
    sampleRate: number | null;
    outputMode: "none" | "worklet" | "script";
    errorMessage: string | null;
};
export type VgmRuntimeOptions = {
    ym2612ModuleFactory?: typeof ym2612ModuleFactory;
    segaPsgModuleFactory?: typeof segaPsgModuleFactory;
    ym2612ModuleOptions?: object;
    segaPsgModuleOptions?: object;
    audioContext?: AudioContext | null;
    audioWorkletUrl?: string;
    workletUrl?: string;
    masterVolume?: number;
    onStatus?: ((message: string) => void) | null;
    onStateChange?: ((state: VgmRuntimeState) => void) | null;
};
/**
 * @typedef {{
 *   audio: "idle" | "preparing" | "ready" | "error",
 *   playback: "stopped" | "playing" | "paused",
 *   hasBuffer: boolean,
 *   loopEnabled: boolean,
 *   queuedFrames: number,
 *   processedEvents: number,
 *   processedWaitSamples: number,
 *   totalSamples: number,
 *   audioProgress: number,
 *   sampleRate: number | null,
 *   outputMode: "none" | "worklet" | "script",
 *   errorMessage: string | null,
 * }} VgmRuntimeState
 */
/**
 * @typedef {{
 *   ym2612ModuleFactory?: typeof ym2612ModuleFactory,
 *   segaPsgModuleFactory?: typeof segaPsgModuleFactory,
 *   ym2612ModuleOptions?: object,
 *   segaPsgModuleOptions?: object,
 *   audioContext?: AudioContext | null,
 *   audioWorkletUrl?: string,
 *   workletUrl?: string,
 *   masterVolume?: number,
 *   onStatus?: ((message: string) => void) | null,
 *   onStateChange?: ((state: VgmRuntimeState) => void) | null,
 * }} VgmRuntimeOptions
 */
/**
 * Create a small browser-facing runtime around `VgmPlayer`.
 *
 * The goal is to keep `VgmPlayer` readable and reusable while moving the
 * AudioContext / AudioWorklet orchestration into one place, similar to
 * `Playground(...)`.
 *
 * @param {VgmRuntimeOptions} [options]
 */
export declare function createVgmRuntime(options?: VgmRuntimeOptions): {
    initialize: () => Promise<undefined>;
    load: (buffer: ArrayBuffer | Uint8Array, parserOptions?: Parameters<typeof VgmPlayer.prototype.load>[1]) => Promise<void>;
    play: () => Promise<void>;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    replay: () => Promise<void>;
    finalize: () => Promise<void>;
    getState: () => VgmRuntimeState;
    setLoopEnabled: (enabled: any) => void;
    setPrefetchFactor: (factor: any) => void;
    setMaxFillStepsPerProcess: (steps: any) => void;
    setMasterVolume: (volume: any) => number;
    getMasterVolume: () => any;
    readonly status: string;
    readonly player: null;
    readonly engine: null;
};
export declare const VgmRuntime: typeof createVgmRuntime;

import { EventEmitter } from 'node:events';
import { createNativeFXController } from '../native_fx.js';
export type NodeFM = Pick<import('../ym2612synth.js').YM2612Synth, 'setPreset' | 'setOperator' | 'setAlgo' | 'setPan' | 'setLfo' | 'setFrequency' | 'noteOn' | 'noteOff' | 'write' | 'reset' | 'setDacEnabled' | 'writeDac' | 'setChannel3SpecialMode' | 'setChannel3SpecialFrequency'>;
export type AsyncNodeFM = {
    [K in keyof NodeFM]: (...args: Parameters<NodeFM[K]>) => Promise<ReturnType<NodeFM[K]>>;
};
export type OutputConnectionOptions = {
    outputModule?: string;
    outputOptions?: Record<string, unknown>;
    bufferFrames?: number;
};
export type MegaSynthNodeOptions = {
    sampleRate?: number;
    masterVolume?: number;
    queueBlocks?: number;
    bufferFrames?: number;
    outputModule?: string | null;
    outputOptions?: Record<string, unknown>;
    mega32X?: boolean;
    pwmOptions?: import('../pwm32x.js').PWM32XOptions;
    engineOptions?: import('../megasynth_session.js').MegaSynthSessionOptions;
};
export type MegaSynthNodeState = {
    state: string;
    sampleRate: number;
    currentFrame: number;
    currentTime: number;
    maxQueuedFrames: number;
    peak: number;
    output: Record<string, unknown> | null;
    pendingTimers: number;
    recording: {
        recording: boolean;
        playing: boolean;
    } | null;
    looper: ReturnType<import('../looper.js').MegaSynthLooper['getState']> | null;
};
export type FMCommand = {
    [K in keyof AsyncNodeFM]: {
        target: 'fm';
        method: K;
        args: Parameters<AsyncNodeFM[K]>;
    };
}[keyof AsyncNodeFM];
export type NodeRecording = Awaited<ReturnType<typeof import('../megasynth_session.js').createMegaSynthSession>>['recording'];
export type AsyncNodeRecording = {
    [K in keyof NodeRecording]: (...args: Parameters<NodeRecording[K]>) => Promise<ReturnType<NodeRecording[K]>>;
};
export type NodeLooper = Pick<import('../looper.js').MegaSynthLooper, 'stop' | 'clear' | 'startRecording' | 'finishRecording' | 'toggleRecord' | 'undo' | 'noteOn' | 'noteOff' | 'getState' | 'getUnits'>;
export type AsyncNodeLooper = {
    [K in keyof NodeLooper]: (...args: Parameters<NodeLooper[K]>) => Promise<Awaited<ReturnType<NodeLooper[K]>>>;
} & {
    start(): Promise<ReturnType<NodeLooper['getState']>>;
    exportAudio(id: string): Promise<import('../wav.js').StereoPCM>;
};
export declare class MegaSynthNode extends EventEmitter {
    #private;
    /** @type {import("../pwm32x_playback.js").AsyncPWMAPI} */
    pwm: import("../pwm32x_playback.js").AsyncPWMAPI;
    /** @type {AsyncNodeFM} */
    fm: AsyncNodeFM;
    /** @type {AsyncNodeRecording} */
    recording: AsyncNodeRecording;
    /** @type {AsyncNodeLooper} */
    looper: AsyncNodeLooper;
    state: string;
    /** @type {ReturnType<typeof createNativeFXController> | undefined} */
    fx: ReturnType<typeof createNativeFXController> | undefined;
    /** @param {MegaSynthNodeOptions} [options] */
    constructor(options?: MegaSynthNodeOptions);
    /** @returns {Promise<MegaSynthNode>} */
    start(): Promise<MegaSynthNode>;
    get lastError(): any;
    flush(): Promise<void>;
    /** @param {number} frame @param {FMCommand | {target: 'looper', method: string, args: unknown[]}} command */
    schedule(frame: number, command: FMCommand | {
        target: 'looper';
        method: string;
        args: unknown[];
    }): Promise<any>;
    /** @returns {Promise<MegaSynthNodeState>} */
    getState(): Promise<MegaSynthNodeState>;
    /** Explicit PCM transfer for offline rendering / WAV export. */
    /** @param {number} frames @returns {Promise<import("../wav.js").StereoPCM & {right: Float32Array}>} */
    render(frames: number): Promise<import("../wav.js").StereoPCM & {
        right: Float32Array;
    }>;
    /** @param {OutputConnectionOptions} [options] @returns {Promise<MegaSynthNodeState>} */
    connectOutput(options?: OutputConnectionOptions): Promise<MegaSynthNodeState>;
    /** @returns {Promise<MegaSynthNodeState>} */
    disconnectOutput(): Promise<MegaSynthNodeState>;
    stop(): Promise<void>;
    resume(): Promise<void>;
    /** @returns {Promise<void>} */
    close(): Promise<void>;
}

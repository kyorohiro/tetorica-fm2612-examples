/**
 * @file vgmplayer.js
 * 実行環境: Browser / Node.js
 * 依存: VGM パーサーと注入された音声エンジン。PCM 生成にはエンジンが必要。AudioContext は不要。
 */
import { Ym2612VGM } from "./ym2612vgm.js";
export type VgmAudioChunk = {
    left: Float32Array;
    right: Float32Array;
    offset: number;
};
export type VgmPlaybackEngine = {
    reset(): void;
    sampleRate(): number;
    writeYm2612(port: number, register: number, value: number): void;
    writeYm2608?(port: number, register: number, value: number): void;
    loadAdpcmBMemory?(data: Uint8Array, offset: number, memorySize: number): void;
    clearAdpcmBMemory?(): void;
    writeAy8910?(register: number, value: number): void;
    writeK051649?(port: number, register: number, value: number): void;
    writeSegaPcm?(offset: number, value: number): void;
    writeGameboyApu?(register: number, value: number): void;
    writeY8950?(register: number, value: number): void;
    writeYmf278b?(port: number, register: number, value: number): void;
    loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void;
    clearSampleMemory?(): void;
    writeYm3526?(register: number, value: number): void;
    writeYm3812?(register: number, value: number): void;
    writeYmf262?(port: number, register: number, value: number): void;
    writeYm2151?(register: number, value: number): void;
    writeYm2413?(register: number, value: number): void;
    writeYm2203?(register: number, value: number): void;
    writeRf5c164?(register: number, value: number): void;
    writeRf5c164Memory?(offset: number, value: number): void;
    loadRf5c164Memory?(data: Uint8Array, offset: number): void;
    clearRf5c164Memory?(): void;
    writePsg(value: number): void;
    processFrames(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
};
/**
 * One rendered stereo chunk waiting to be copied into the audio callback
 * buffers.
 *
 * @typedef {{
 *   left: Float32Array,
 *   right: Float32Array,
 *   offset: number,
 * }} VgmAudioChunk
 */
/**
 * Minimal audio engine shape used by `VgmPlayer`.
 *
 * @typedef {{
 *   reset(): void,
 *   sampleRate(): number,
 *   writeYm2612(port: number, register: number, value: number): void,
 *   writeYm2608?(port: number, register: number, value: number): void,
 *   loadAdpcmBMemory?(data: Uint8Array, offset: number, memorySize: number): void,
 *   clearAdpcmBMemory?(): void,
 *   writeAy8910?(register: number, value: number): void,
 *   writeK051649?(port: number, register: number, value: number): void,
 *   writeSegaPcm?(offset: number, value: number): void,
 *   writeGameboyApu?(register: number, value: number): void,
 *   writeY8950?(register: number, value: number): void,
 *   writeYmf278b?(port: number, register: number, value: number): void,
 *   loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void,
 *   clearSampleMemory?(): void,
 *   writeYm3526?(register: number, value: number): void,
 *   writeYm3812?(register: number, value: number): void,
 *   writeYmf262?(port: number, register: number, value: number): void,
 *   writeYm2151?(register: number, value: number): void,
 *   writeYm2413?(register: number, value: number): void,
 *   writeYm2203?(register: number, value: number): void,
 *   writeRf5c164?(register: number, value: number): void,
 *   writeRf5c164Memory?(offset: number, value: number): void,
 *   loadRf5c164Memory?(data: Uint8Array, offset: number): void,
 *   clearRf5c164Memory?(): void,
 *   writePsg(value: number): void,
 *   processFrames(frames: number): { left: Float32Array, right: Float32Array },
 * }} VgmPlaybackEngine
 */
/**
 * Streaming VGM player that steps a `Ym2612VGM` parser and renders audio
 * into queued stereo chunks.
 */
export declare class VgmPlayer {
    #private;
    /** @type {VgmPlaybackEngine} */
    engine: VgmPlaybackEngine;
    /** @type {Ym2612VGM | null} */
    parser: Ym2612VGM | null;
    /** @type {boolean} */
    loopEnabled: boolean;
    /** @type {boolean} */
    playing: boolean;
    /** @type {boolean} */
    paused: boolean;
    /** @type {number} */
    prefetchFactor: number;
    /** @type {number} */
    maxFillStepsPerProcess: number;
    /** @type {number} */
    waitAccumulator: number;
    /** @type {VgmAudioChunk[]} */
    chunkQueue: VgmAudioChunk[];
    /** @type {number} */
    queuedFrames: number;
    /** @type {number} */
    processedEvents: number;
    /** @type {number} */
    processedWaitSamples: number;
    checkpointIntervalSeconds: number;
    checkpointMaxBytes: number;
    checkpointMaxCount: number;
    /**
     * @param {VgmPlaybackEngine} engine
     */
    constructor(engine: VgmPlaybackEngine);
    /**
     * Load one VGM buffer and reset playback state.
     *
     * @param {ArrayBuffer | Uint8Array} buffer
     * @param {ConstructorParameters<typeof Ym2612VGM>[1]} [options]
     * @returns {void}
     */
    load(buffer: ArrayBuffer | Uint8Array, options?: ConstructorParameters<typeof Ym2612VGM>[1]): void;
    /**
     * Reset both parser and playback engine to the start of the loaded VGM.
     *
     * @returns {void}
     */
    reset(): void;
    /**
     * Start playback from the current parser position.
     *
     * @returns {void}
     */
    play(): void;
    /**
     * Pause playback without clearing the queued audio chunks.
     *
     * @returns {void}
     */
    pause(): void;
    /**
     * Resume playback after `pause()`.
     *
     * @returns {void}
     */
    resume(): void;
    /**
     * Stop playback and reset parser/engine state to the beginning.
     *
     * @returns {void}
     */
    stop(): void;
    supportsState(): boolean;
    renderedPositionFrames(): number;
    clearCheckpoints(): void;
    checkpointStats(): {
        count: number;
        bytes: number;
    };
    saveState(): Readonly<{
        byteLength: any;
        frame: number;
    }>;
    loadState(state: any): void;
    captureCheckpoint(): void;
    restoreCheckpoint(targetFrame: any): any;
    /**
     * Adjust the render-ahead queue target relative to the render chunk size.
     * @param {number} factor Clamped to 1..8; nonfinite values are ignored.
     * @returns {void}
     */
    setPrefetchFactor(factor: number): void;
    /**
     * Discard already-generated audio after a live mute/parameter change.
     * Keep the parser, chip state, fractional sample timing and play/pause state.
     */
    clearQueuedAudio(): void;
    /**
     * Limit parser/render work per process call to bound synchronous work.
     * @param {number} steps Floored to an integer, minimum 32; nonfinite values are ignored.
     * @returns {void}
     */
    setMaxFillStepsPerProcess(steps: number): void;
    /**
     * Enable or disable loop playback.
     *
     * @param {boolean} enabled
     * @returns {void}
     */
    setLoopEnabled(enabled: boolean): void;
    /**
     * @returns {boolean}
     */
    isPlaying(): boolean;
    /**
     * @returns {boolean}
     */
    isPaused(): boolean;
    /**
     * Output sample rate of the underlying playback engine.
     *
     * @returns {number}
     */
    sampleRate(): number;
    /**
     * @param {number} volume
     * @returns {number}
     */
    setMasterVolume(volume: number): number;
    /**
     * @returns {number}
     */
    getMasterVolume(): number;
    /**
     * Return a small playback status snapshot for UI/debug use.
     * queuedFrames uses the engine output rate. processedWaitSamples and totalSamples
     * use the 44100 Hz VGM timeline. audioProgress is a percentage of parsed waits,
     * which may run ahead of audible playback because of prefetched audio.
     *
     * @returns {{
     *   playing: boolean,
     *   paused: boolean,
     *   queuedFrames: number,
     *   processedEvents: number,
     *   processedWaitSamples: number,
     *   totalSamples: number,
     *   audioProgress: number,
     * }}
     */
    stats(): {
        playing: boolean;
        paused: boolean;
        queuedFrames: number;
        processedEvents: number;
        processedWaitSamples: number;
        totalSamples: number;
        audioProgress: number;
    };
    /**
     * Fill one stereo output buffer from the queued rendered chunks.
     *
     * When playback is active, this also steps the parser forward and renders
     * more audio until a small queue target is reached.
     *
     * @param {Float32Array} left
     * @param {Float32Array} right
     * @param {number} frames
     * @returns {number} Audio frames copied, excluding end-of-track zero padding.
     */
    process(left: Float32Array, right: Float32Array, frames: number): number;
}
export declare function createVgmTargets(engine: any): {
    resolveChip: any;
    pwm: {
        writeRegister: (register: any, value: any) => any;
    };
    rf5c164: {
        writeRegister: (register: any, value: any) => any;
        writeMemory: (offset: any, value: any) => any;
        loadBankedMemory: (data: any, offset: any) => any;
    } | undefined;
    ym2612: {
        writeRegister: (register: any, value: any, port?: number) => any;
    } | undefined;
    ym2203: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    ym2413: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    ym2151: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    huc6280: {
        writeRegister: (r: any, v: any) => any;
        writeStream: (p: any, r: any, v: any) => any;
    } | undefined;
    okim6295: {
        writeRegister: (r: any, v: any) => any;
        loadSampleMemory: (data: any, offset: any, size: any) => any;
    } | undefined;
    okim6258: {
        writeRegister: (r: any, v: any) => any;
    } | undefined;
    ym3526: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    ym3812: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    ymf262: {
        writeRegister: (register: any, value: any, port: any) => any;
    } | undefined;
    y8950: {
        writeRegister: (register: any, value: any) => any;
        loadSampleMemory: (...args: any[]) => any;
    } | undefined;
    ymf278b: {
        writeRegister: (register: any, value: any, port: any) => any;
        loadSampleMemory: (...args: any[]) => any;
    } | undefined;
    ay8910: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    k051649: {
        writeRegister: (port: any, register: any, value: any) => any;
    } | undefined;
    segapcm: {
        writeRegister: (offset: any, value: any) => any;
        loadSampleMemory: (...args: any[]) => any;
    } | undefined;
    nesApu: {
        writeRegister: (r: any, v: any) => any;
        loadSampleMemory: (data: any, offset: any) => any;
    } | undefined;
    gameboyDmg: {
        writeRegister: (register: any, value: any) => any;
    } | undefined;
    ym2608: {
        writeRegister: (register: any, value: any, port?: number) => any;
        loadAdpcmBMemory: ((data: any, offset: any, memorySize: any) => any) | undefined;
    } | undefined;
    ym2610: {
        writeRegister: (register: any, value: any, port?: number) => any;
        loadAdpcmRom: (...args: any[]) => any;
    } | undefined;
    psg: {
        write: (value: any) => any;
    };
};

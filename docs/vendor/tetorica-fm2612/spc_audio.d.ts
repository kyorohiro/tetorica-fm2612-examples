import { TetoricaAudioRuntime } from './tetorica_audio_runtime.js';
export type SpcPlaybackState = {
    ready: boolean;
    loaded: boolean;
    playing: boolean;
    paused: boolean;
    muteMask: number;
    positionSeconds: number;
    playbackNativeFrames: number;
    renderedNativeFrames: number;
    nativeSampleRate: number;
    sampleRate?: number;
    closed?: boolean;
};
export type SpcSnapshot = {
    ram: Uint8Array;
    dsp: Uint8Array;
    nativeFrames: number;
    playbackNativeFrames: number;
    positionSeconds: number;
    nativeSampleRate: number;
    muteMask: number;
};
export type SpcSeekOptions = {
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
    resume?: boolean;
};
/** Browser SPC file player. SPC700/S-DSP generation runs only in AudioWorklet.
 * Native time is fixed at 32,000 stereo frames/s; output follows AudioContext.
 * This is file playback, independent of Playground BPM/Worker lookahead.
 * close() disposes this player; construct a new instance to open another context.
 */
export declare class SpcRuntimeSynth {
    options: {
        audioContext?: AudioContext;
        outputNode?: AudioNode;
        mixer?: import('./soundchip_mixer.js').SoundChipMixer;
        masterVolume?: number;
        workletUrl?: string | URL;
        wasmUrl?: string | URL;
        wasmBinary?: Uint8Array | ArrayBuffer;
        fetch?: typeof globalThis.fetch;
        onError?: (error: Error) => void;
    };
    audio: TetoricaAudioRuntime;
    node: AudioWorkletNode | null;
    closed: boolean;
    failure: any;
    readyPromise: Promise<this> | null;
    controller: AbortController | null;
    closePromise: Promise<void> | null;
    pending: Map<any, any>;
    sequence: number;
    loadToken: number;
    seekToken: number;
    muteMask: number;
    /** @type {SpcPlaybackState} */
    lastState: SpcPlaybackState;
    nodeReady: {
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    } | undefined;
    onContextState: (() => void) | undefined;
    mixerRelease: (() => void) | null | undefined;
    /** @param {{audioContext?:AudioContext,outputNode?:AudioNode,mixer?:import('./soundchip_mixer.js').SoundChipMixer,
     * masterVolume?:number,workletUrl?:string|URL,wasmUrl?:string|URL,wasmBinary?:Uint8Array|ArrayBuffer,
     * fetch?:typeof globalThis.fetch,onError?:(error:Error)=>void}} [options] */
    constructor(options?: {
        audioContext?: AudioContext;
        outputNode?: AudioNode;
        mixer?: import('./soundchip_mixer.js').SoundChipMixer;
        masterVolume?: number;
        workletUrl?: string | URL;
        wasmUrl?: string | URL;
        wasmBinary?: Uint8Array | ArrayBuffer;
        fetch?: typeof globalThis.fetch;
        onError?: (error: Error) => void;
    });
    get audioContext(): AudioContext | null;
    get mixer(): import("./soundchip_mixer.js").SoundChipMixer;
    isReady(): boolean;
    /** @param {number} volume Linear output gain, 0..3.8. @returns {number} */
    setMasterVolume(volume: number): number;
    getMasterVolume(): number;
    assertOpen(): void;
    /** @returns {Promise<SpcRuntimeSynth>} */
    start(): Promise<SpcRuntimeSynth>;
    initialize(signal: any): Promise<this>;
    request(type: any, data?: {}, transfer?: any[]): Promise<any>;
    /** @param {Uint8Array|ArrayBuffer} input @returns {Promise<SpcPlaybackState>} */
    loadSPC(input: Uint8Array | ArrayBuffer): Promise<SpcPlaybackState>;
    /** @returns {Promise<SpcPlaybackState>} */
    play(): Promise<SpcPlaybackState>;
    /** @returns {Promise<SpcPlaybackState>} */
    pause(): Promise<SpcPlaybackState>;
    /** @returns {Promise<SpcPlaybackState>} */
    stop(): Promise<SpcPlaybackState>;
    /** @returns {Promise<SpcPlaybackState>} */
    restart(): Promise<SpcPlaybackState>;
    /** Bits 0..7 mute SPC DSP voices. Their envelopes/pitch/BRR state still advance.
     * Already rendered samples (one 4 ms resampling block plus the core's short
     * native queue) and existing echo tails can remain.
     * @param {number} mask @returns {Promise<SpcPlaybackState>}
     */
    setMuteMask(mask: number): Promise<SpcPlaybackState>;
    /** @param {number} channel @param {boolean} muted @returns {Promise<SpcPlaybackState>} */
    setVoiceMuted(channel: number, muted: boolean): Promise<SpcPlaybackState>;
    /** Current processor clock/state, rather than an extrapolated UI clock.
     * @returns {Promise<SpcPlaybackState>} */
    getState(): Promise<SpcPlaybackState>;
    /** Atomic emulator snapshot for BRR/DSP inspection. nativeFrames counts native
     * generation, while playbackNativeFrames/positionSeconds identify audio output.
     * @returns {Promise<SpcSnapshot>}
     */
    snapshot(): Promise<SpcSnapshot>;
    /** Replay from the loaded snapshot in bounded 0.5-second native blocks. Every
     * block is rendered in the Worklet; messages yield between blocks for Cancel.
     * @param {number} seconds Native elapsed seconds, independent of BPM.
     * @param {SpcSeekOptions} [options]
     * @returns {Promise<SpcPlaybackState>}
     */
    seek(seconds: number, { signal, onProgress, resume }?: SpcSeekOptions): Promise<SpcPlaybackState>;
    fail(error: any): void;
    releaseAudio(): void;
    /** @returns {Promise<void>} */
    close(): Promise<void>;
}

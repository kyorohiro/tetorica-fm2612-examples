/** Ordered Main/logic-Worker client for a CPU-free SNES DSP AudioWorklet. */
import { SnesSynth } from './snessynth.js';
/** @param {MessagePort} port
 * @param {{sampleRate?:number,nativeSampleRate?:number}} [initial] */
export declare function createSnesClient(port: MessagePort, initial?: {
    sampleRate?: number;
    nativeSampleRate?: number;
}): {
    _getState(): import("./snessynth.js").SnesState;
    _stopVoices(): Promise<any>;
    _adoptState(state: any): void;
    sampleRate: number;
    nativeSampleRate: number;
    /** @param {ArrayBuffer|ArrayBufferView} input @param {import('./snessynth.js').SnesBRROptions} options
     * @returns {Promise<import('./snessynth.js').SnesSample>} */
    loadBRR(input: ArrayBuffer | ArrayBufferView, options: import('./snessynth.js').SnesBRROptions): Promise<import('./snessynth.js').SnesSample>;
    /** Resource upload; clocks are 1,024,000 Hz, not native PCM frames.
     * @param {import('./spc.js').SpcTimeline} trace */
    prepareTimeline(trace: import('./spc.js').SpcTimeline): Promise<any>;
    /** Resolves at the output end. Stop/dispose rejects pending playback. */
    playTimeline(): Promise<any>;
    stopTimeline(): Promise<any>;
    getTimelineState(): Promise<any>;
    /** @param {number} ch @param {import('./snessynth.js').SnesPreset} preset */
    setPreset(ch: number, preset: import('./snessynth.js').SnesPreset): void;
    /** @param {number} ch @param {import('./snessynth.js').SnesPreset} params */
    setChannel(ch: number, params: import('./snessynth.js').SnesPreset): void;
    /** @param {number} ch @param {number} pitch */
    setPitch(ch: number, pitch: number): void;
    /** @param {number} ch @param {number} hz */
    setFrequency(ch: number, hz: number): void;
    /** @param {number} ch @param {string|number} note */
    setNote(ch: number, note: string | number): void;
    /** @param {number} ch */ keyOn(ch: number): void;
    /** @param {number} ch */ keyOff(ch: number): void;
    /** @param {number} ch @param {string|number} [note] */ noteOn(ch: number, note?: string | number): void;
    /** @param {number} ch */ noteOff(ch: number): void;
    allNotesOff(): void;
    reset(): void;
    /** @param {number} register @param {number} value */ writeDsp(register: number, value: number): void;
    /** @param {number} register @returns {Promise<number>} */ readDsp(register: number): Promise<number>;
    /** Applied audio state; queued future changes may not yet be audible.
     * @returns {Promise<ReturnType<SnesSynth['getState']>>} */ getState(): Promise<ReturnType<SnesSynth['getState']>>;
    /** @param {number} ch @returns {Promise<import('./snessynth.js').SnesVoiceState>} */ getPreset(ch: number): Promise<import('./snessynth.js').SnesVoiceState>;
    /** @returns {Promise<ReturnType<SnesSynth['snapshot']>>} */ snapshot(): Promise<ReturnType<SnesSynth['snapshot']>>;
    dispose(): void;
};

/** Ordered Browser/logic-Worker controls for the experimental PS1 SPU. */
import { Ps1Synth } from './ps1synth.js';
/** @param {MessagePort} port @param {{sampleRate?:number,state?:any}} [initial] */
export declare function createPs1Client(port: MessagePort, initial?: {
    sampleRate?: number;
    state?: any;
}, lifecycle?: {}): {
    sampleRate: number;
    nativeSampleRate: number;
    channelCount: number;
    _getState(): {
        sampleRate: number;
        channelCount: number;
        nextAddress: number;
        nativeFrames: number;
        samples: {
            id: number;
            startAddress: number;
            repeatAddress: number;
            byteLength: number;
            decodedFrames: number;
            rootNote: string | number | null;
            rootFrequencyHz: number;
            basePitch: number;
            loop: boolean;
            loopStartSamples: number | null;
            editorChannel?: number;
        }[];
        reverb: {
            preset: import("./ps1_parameters.js").Ps1ReverbPreset;
            volumeLeft: number;
            volumeRight: number;
        };
        channels: {
            sample: number | null;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            pitch: number;
            reverb: boolean;
            waveform: {
                sample: number;
                pcm: number[];
            } | null;
            envelopeParameters: import("./ps1_parameters.js").Ps1Envelope;
            gate: boolean;
            envelope: number;
            ended: boolean;
        }[];
    };
    _setLifecycle(options: any): void;
    _adoptState(state: any): void;
    _applyAuthorEdit(edit: any): void;
    _stopVoices(): Promise<any>;
    /** @param {ArrayBuffer|ArrayBufferView} input @param {import('./ps1synth.js').Ps1ADPCMOptions} options */
    loadADPCM(input: ArrayBuffer | ArrayBufferView, options: import('./ps1synth.js').Ps1ADPCMOptions): Promise<any>;
    /** @param {number} ch @param {import('./ps1synth.js').Ps1Preset} preset @param {import('./ps1synth.js').Ps1EnvelopeUpdateOptions} [options] */
    setPreset(ch: number, preset: import('./ps1synth.js').Ps1Preset, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    /** @param {number} ch @param {import('./ps1synth.js').Ps1Preset} preset @param {import('./ps1synth.js').Ps1EnvelopeUpdateOptions} [options] */
    setChannel(ch: number, preset: import('./ps1synth.js').Ps1Preset, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    /** Named ADSR register fields. Rates are table indexes, not milliseconds.
     * @param {number} ch @param {Partial<import('./ps1_parameters.js').Ps1Envelope>} envelope @param {import('./ps1synth.js').Ps1EnvelopeUpdateOptions} [options] */
    setEnvelope(ch: number, envelope: Partial<import('./ps1_parameters.js').Ps1Envelope>, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    /** Shared SPU reverb preset and positive return levels; voices opt in separately.
     * @param {Partial<import('./ps1_parameters.js').Ps1Reverb>} options */
    setReverb(options: Partial<import('./ps1_parameters.js').Ps1Reverb>): void;
    /** @param {number} ch @param {number} pitch */ setPitch(ch: number, pitch: number): void;
    /** @param {number} ch @param {number} hz */ setFrequency(ch: number, hz: number): void;
    /** @param {number} ch @param {string|number} note */ setNote(ch: number, note: string | number): void;
    /** @param {number} ch */ keyOn(ch: number): void;
    /** @param {number} ch */ keyOff(ch: number): void;
    /** @param {number} ch @param {string|number} [note] */ noteOn(ch: number, note?: string | number): void;
    /** @param {number} ch */ noteOff(ch: number): void;
    allNotesOff(): void;
    /** Immediate preparation barrier, including in Worker mode. Clears prior
     * reserved notes; later voice controls retain their normal lookahead.
     * @param {{clearRam?:boolean}} [options] */ reset(options?: {
        clearRam?: boolean;
    }): void;
    /** @returns {Promise<ReturnType<Ps1Synth['getState']>>} */ getState(): Promise<ReturnType<Ps1Synth['getState']>>;
    /** @param {number} ch @returns {Promise<ReturnType<Ps1Synth['getPreset']>>} */ getPreset(ch: number): Promise<ReturnType<Ps1Synth['getPreset']>>;
    /** @returns {Promise<ReturnType<Ps1Synth['snapshot']>>} */ snapshot(): Promise<ReturnType<Ps1Synth['snapshot']>>;
    dispose(): void;
};

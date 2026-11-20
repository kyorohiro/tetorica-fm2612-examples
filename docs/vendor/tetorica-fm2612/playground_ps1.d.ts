/** @param {MessagePort} port @param {{sampleRate?:number,state?:any}} [initial] */
export declare function createPs1Client(port: MessagePort, initial?: {
    sampleRate?: number;
    state?: any;
}, lifecycle?: {}): {
    sampleRate: number;
    nativeSampleRate: number;
    channelCount: number;
    _requestControl: (method: any, args?: any[], transfer?: any[]) => Promise<any>;
    _getState(): {
        sampleRate: number;
        channelCount: number;
        nextAddress: number;
        nativeFrames: number;
        noiseClock: number;
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
            noise: boolean;
            pmon: boolean;
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
    /** Hardware Noise bit; does not allocate or trigger a sample. @param {number} ch @param {boolean} enabled */
    setNoiseEnabled(ch: number, enabled: boolean): void;
    /** Shared clock code 0..63. @param {number} code */ setNoiseClock(code: number): void;
    /** Previous physical CH is the source; no auto pairing. @param {number} ch @param {boolean} enabled */
    setPmonEnabled(ch: number, enabled: boolean): void;
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
    /** @returns {Promise<ReturnType<import('./ps1synth.js').Ps1Synth['getState']>>} */ getState(): Promise<ReturnType<import('./ps1synth.js').Ps1Synth['getState']>>;
    /** @param {number} ch @returns {Promise<ReturnType<import('./ps1synth.js').Ps1Synth['getPreset']>>} */ getPreset(ch: number): Promise<ReturnType<import('./ps1synth.js').Ps1Synth['getPreset']>>;
    /** @returns {Promise<ReturnType<import('./ps1synth.js').Ps1Synth['snapshot']>>} */ snapshot(): Promise<ReturnType<import('./ps1synth.js').Ps1Synth['snapshot']>>;
    dispose(): void;
} & {
    build: typeof import('./ps1_operations.js').buildPs1Operations;
    captureState: () => Promise<ReturnType<typeof import('./ps1_timed_state.js').createPs1TimedSnapshot>>;
    compile: (operations: any, options?: any) => Promise<any[]>;
    schedule: (operations: any, options: any) => Promise<any>;
    clearSchedule: (name: string) => Promise<boolean>;
};

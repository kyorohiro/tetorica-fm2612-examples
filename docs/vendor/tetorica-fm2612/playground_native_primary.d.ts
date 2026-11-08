/** Primary controls borrow devices owned by the runtime. */
export declare function borrowNativeApi(raw: any, id: any, changed?: () => void, before?: () => boolean, settle?: (result: any) => any): any;
export declare function createNativePrimaryClient(name: any, port: any, options?: {}, lifecycle?: {}): {
    sampleRate: any;
    nativeSampleRate: number;
    channelCount: number;
    _getState: () => {
        sampleRate: number;
        bankId: string;
        nextSampleId: number;
        ramUsedBytes: number;
        ramFreeBytes: number;
        playingFrequencies: any[];
        playingLfos: any[];
        playingModulations: any[];
        playingSampleIds: any[];
        samples: any[];
        slots: {
            sample: null;
            frequencyHz: number;
            totalLevel: number;
            directLevel: number;
            pan: number;
            envelope: {
                attackRate: number;
                decay1Rate: number;
                decay2Rate: number;
                decayLevel: number;
                releaseRate: number;
                keyRateScaling: number;
            };
            lfo: {
                frequencyCode: number;
                pitchWave: number;
                pitchDepth: number;
                amplitudeWave: number;
                amplitudeDepth: number;
                reset: boolean;
            };
            modulation: {
                depth: number;
                xOffset: number;
                yOffset: number;
                writeInhibit: boolean;
            };
            gate: any;
        }[];
    };
    _setLifecycle: (options: any) => void;
    _applyAuthorEdit: (edit: any) => void;
    _adoptState: (state: any) => void;
    _stopVoices: () => Promise<any>;
    loadPCM(input: any, options: any): Promise<any>;
    getState: () => Promise<any>;
    dispose(): void;
} | {
    _getState(): {
        sampleRate: number;
        samples: import("./snessynth.js").SnesSample[];
        channels: import("./snessynth.js").SnesVoiceState[];
        nextAddress: number;
        directoryAddress: number;
        maxSampleBytes: number;
        echo: import("./snessynth.js").SnesEchoState;
        stateRevision?: number | undefined;
    };
    _stopVoices(): Promise<any>;
    _adoptState(state: any): false | undefined;
    _applyAuthorEdit(edit: any): void;
    sampleRate: number;
    nativeSampleRate: number;
    loadBRR(input: ArrayBuffer | ArrayBufferView, options: import('./snessynth.js').SnesBRROptions): Promise<import('./snessynth.js').SnesSample>;
    setEcho(options?: Partial<import('./snessynth.js').SnesEchoOptions>): Promise<import('./snessynth.js').SnesEchoState>;
    getEcho(): Promise<import('./snessynth.js').SnesEchoState>;
    prepareTimeline(trace: import('./spc.js').SpcTimeline): Promise<any>;
    playTimeline(): Promise<any>;
    stopTimeline(): Promise<any>;
    getTimelineState(): Promise<any>;
    setPreset(ch: number, preset: import('./snessynth.js').SnesPreset): void;
    setChannel(ch: number, params: import('./snessynth.js').SnesPreset): void;
    setPitch(ch: number, pitch: number): void;
    setFrequency(ch: number, hz: number): void;
    setNote(ch: number, note: string | number): void;
    keyOn(ch: number): void;
    keyOff(ch: number): void;
    noteOn(ch: number, note?: string | number): void;
    noteOff(ch: number): void;
    allNotesOff(): void;
    reset(): void;
    writeDsp(register: number, value: number): void;
    readDsp(register: number): Promise<number>;
    getState(): Promise<ReturnType<import("./snessynth.js").SnesSynth['getState']>>;
    getPreset(ch: number): Promise<import('./snessynth.js').SnesVoiceState>;
    snapshot(): Promise<ReturnType<import("./snessynth.js").SnesSynth['snapshot']>>;
    dispose(): void;
} | {
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
    loadADPCM(input: ArrayBuffer | ArrayBufferView, options: import('./ps1synth.js').Ps1ADPCMOptions): Promise<any>;
    setPreset(ch: number, preset: import('./ps1synth.js').Ps1Preset, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    setChannel(ch: number, preset: import('./ps1synth.js').Ps1Preset, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    setEnvelope(ch: number, envelope: Partial<import('./ps1_parameters.js').Ps1Envelope>, options?: import('./ps1synth.js').Ps1EnvelopeUpdateOptions): void;
    setReverb(options: Partial<import('./ps1_parameters.js').Ps1Reverb>): void;
    setPitch(ch: number, pitch: number): void;
    setFrequency(ch: number, hz: number): void;
    setNote(ch: number, note: string | number): void;
    keyOn(ch: number): void;
    keyOff(ch: number): void;
    noteOn(ch: number, note?: string | number): void;
    noteOff(ch: number): void;
    allNotesOff(): void;
    reset(options?: {
        clearRam?: boolean;
    }): void;
    getState(): Promise<ReturnType<import("./ps1synth.js").Ps1Synth['getState']>>;
    getPreset(ch: number): Promise<ReturnType<import("./ps1synth.js").Ps1Synth['getPreset']>>;
    snapshot(): Promise<ReturnType<import("./ps1synth.js").Ps1Synth['snapshot']>>;
    dispose(): void;
} | {
    sampleRate: number;
    internalSampleRate: number;
    readonly voices: {
        index: number;
        name: string;
    }[];
    readonly selectedVoice: number;
    _getState(): {
        sampleRate: number;
        internalSampleRate: number;
        voices: {
            index: number;
            name: string;
        }[];
        selectedVoice: number;
        stateRevision: number;
    };
    _adoptState(state: any): false | undefined;
    _onStateChange(listener: any): () => boolean;
    _stopVoices(): Promise<any>;
    getState(): Promise<any>;
    loadSysex(input: any): Promise<any>;
    setPreset(preset: import('./msfa_dx7/src/preset.js').DX7Preset): Promise<void>;
    setOperator(operator: 1 | 2 | 3 | 4 | 5 | 6, params: import('./msfa_dx7/src/preset.js').DX7OperatorParams): Promise<void>;
    setOperators(entries: ReadonlyArray<readonly [1 | 2 | 3 | 4 | 5 | 6, import('./msfa_dx7/src/preset.js').DX7OperatorParams]>): Promise<void>;
    setFeedback(feedback: number): Promise<void>;
    getPreset(): Promise<import('./msfa_dx7/src/preset.js').DX7PresetState>;
    selectVoice(index: number): void;
    noteOn(note: number, velocity?: number): void;
    noteOff(note: number): void;
    allNotesOff(): void;
    panic(): void;
    dispose(): void;
} | import("./playground_sid.js").SidClient | (import("./ay8910synth.js").AY8910Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
}) | (import("./pwm32x_playback.js").AsyncPWMAPI & {
    dispose(): void;
    stopVoices?: () => Promise<void>;
}) | (import("./nesapusynth.js").NesApuSynth & {
    _stopVoices: () => Promise<void>;
}) | (import("./opl_synth.js").OPLSynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
}) | (import("./pokeysynth.js").PokeySynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
}) | (import("./ym2413synth.js").YM2413Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
}) | ({
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
});
/** Each endpoint keeps a direct Worker -> Worklet performance port. */
export declare function createNativeWorkerApis(connections: any, performance: any, observe: any, lifecycle?: {}): {
    apis: {};
    raw: Map<any, any>;
    cancelAdpcmLoads(): void;
    stop(): Promise<any[]>;
    adopt(name: any, state: any, authorEdit: any): void;
};

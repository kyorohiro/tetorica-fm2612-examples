export declare function createNativeGenesisDx7(synth: any): {
    client: {
        id: string;
        internalSampleRate: number;
        readonly sampleRate: any;
        readonly voices: any;
        readonly selectedVoice: any;
        _getState: () => {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        };
        _onStateChange(listener: any): () => boolean;
        _adoptState(): boolean;
        _stopVoices(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        getState(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        loadSysex(bytes: any): Promise<any>;
        setPreset(preset: any): Promise<void>;
        setOperator(operator: any, params: any): Promise<void>;
        setOperators(entries: any): Promise<void>;
        setFeedback(value: any): Promise<void>;
        getPreset(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        selectVoice(index: any): void;
        noteOn(note: any, velocity?: number): void;
        noteOff(note: any): void;
        allNotesOff(): void;
        panic(): void;
        dispose(): void;
    };
    dispatch(message: any, timing?: {}): Promise<{
        id: any;
        value: import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined;
    } | undefined>;
    read(): Promise<{
        kind: string;
        sampleRate: number;
        internalSampleRate: number;
        polyphony: number;
        selectedVoice: number;
        voices: any;
        preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
        activeSource: string;
        activeNotes: {
            midi: any;
            velocity: any;
            manual: boolean;
        }[];
        auditions: {
            channel: number;
            midi: any;
            id: any;
        }[];
        logical: {
            selectedVoice: number;
            voices: any;
            preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
            pendingCommands: number;
        };
    }>;
    invoke(method: any, args?: any[]): Promise<any>;
    mix(volume: any, pan: any): Promise<void>;
    performance(request: any): Promise<void>;
    stopped(): void;
    adoptStopped(snapshot: any): void;
    reset(): void;
    dispose(): void;
};

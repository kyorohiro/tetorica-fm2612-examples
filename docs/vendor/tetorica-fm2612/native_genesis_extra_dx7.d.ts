export declare const EXTRA_DX7_VOICE_HELD_ERROR = "Release the manually held additional DX7 voices before changing the voice";
export declare function createNativeGenesisExtraDx7Endpoint(synth: any): {
    client: {
        internalSampleRate: number;
        readonly sampleRate: any;
        readonly voices: any;
        readonly selectedVoice: any;
        _getState: () => {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: number;
            stateRevision: number;
        };
        _onStateChange(listener: any): () => boolean;
        _adoptState(): boolean;
        _allocateMainOwner: () => number;
        _withMainOwner(group: any, callback: any): any;
        _cancelMainOwner(group: any): void;
        _stopVoices(): Promise<true | import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: number;
            stateRevision: number;
        }>;
        getState(): Promise<true | import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: number;
            stateRevision: number;
        }>;
        loadSysex(bytes: any): Promise<any>;
        setPreset(preset: any): Promise<void>;
        setOperator(operator: any, params: any): Promise<void>;
        setOperators(entries: any): Promise<void>;
        setFeedback(value: any): Promise<void>;
        getPreset(): Promise<true | import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: number;
            stateRevision: number;
        }>;
        selectVoice(index: any): void;
        noteOn(note: any, velocity?: number): void;
        noteOff(note: any): void;
        allNotesOff(): void;
        panic(): void;
        dispose(): void;
    };
    dispatch(message: any, timing?: {}): Promise<{
        id: any;
        value: boolean | import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: number;
            stateRevision: number;
        };
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
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraDx7(synth: any, options?: {}): Promise<{
    native: boolean;
    ready: boolean;
    nativeInstance: number;
    kind: any;
    label: any;
    client: any;
    endpoint: any;
    clock: any;
    stereoEnabled: any;
    engine?: any;
    layout: {};
    dispose(): void;
    mix(settings: any): void;
}>;

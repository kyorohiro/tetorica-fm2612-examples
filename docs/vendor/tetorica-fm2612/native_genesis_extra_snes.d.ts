export declare const EXTRA_SNES_MEMORY_HELD_ERROR = "Release the manually held additional SNES voices before replacing sample memory";
export declare const EXTRA_SNES_STATE_HELD_ERROR = "Release the manually held additional SNES voices before replacing the DSP state";
export declare const EXTRA_SNES_ADMISSION_ERRORS: readonly string[];
export declare function createNativeGenesisExtraSnesEndpoint(synth: any): {
    client: {
        sampleRate: any;
        nativeSampleRate: number;
        _getState: () => {
            sampleRate: number;
            samples: import("./snessynth.js").SnesSample[];
            channels: import("./snessynth.js").SnesVoiceState[];
            nextAddress: number;
            stateRevision: number;
            timeline?: any;
        };
        _adoptState(): boolean;
        _allocateMainOwner: () => number;
        _withMainOwner(group: any, callback: any): any;
        _cancelMainOwner(group: any): void;
        _stopVoices(): Promise<void>;
        loadBRR: (input: any, options: any, timing?: {}) => Promise<any>;
        prepareTimeline: (trace: any, timing?: {}) => Promise<any>;
        playTimeline: (timing?: {}) => Promise<any>;
        stopTimeline: (timing?: {}) => Promise<any>;
        getTimelineState: () => Promise<any>;
        readDsp: (register: any) => Promise<any>;
        getState: () => Promise<any>;
        getPreset: (ch: any) => Promise<any>;
        snapshot: () => Promise<any>;
        dispose(): void;
    };
    dispatch: (message: any, timing?: {}) => {
        id: any;
        value: boolean;
        deferred?: undefined;
    } | {
        id?: undefined;
        value?: undefined;
        deferred: Promise<{
            id: any;
            value: any;
        } | undefined>;
    } | undefined;
    invoke: (method: any, args?: any[]) => Promise<boolean>;
    read(): Promise<{
        kind: string;
        sampleRate: number;
        nativeSampleRate: number;
        activeSource: string;
        samples: import("./snessynth.js").SnesSample[];
        channels: {
            sample: any;
            adsr1: number;
            adsr2: number;
            gain: number;
            volumeLeft: any;
            volumeRight: any;
            pitch: number;
            channel: number;
            type: string;
            active: boolean;
            frequency: number | null;
        }[];
        auditions: {
            channel: any;
            id: any;
        }[];
        timeline: {
            loaded: boolean;
            positionFrames: number;
            totalFrames: number;
            ended: boolean;
            playing: boolean;
        };
    }>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraSnes(synth: any, options?: {}): Promise<{
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

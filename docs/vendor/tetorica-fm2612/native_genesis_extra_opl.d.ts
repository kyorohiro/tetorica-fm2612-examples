export declare const EXTRA_OPL_CHIPS: readonly string[];
export declare const extraOplClockHeldError: (kind: any) => string;
export declare function createNativeGenesisExtraOplEndpoint(synth: any, { kind }?: {
    kind?: string | undefined;
}): {
    client: any;
    dispatch: (message: any, timing: {} | undefined, scope: any) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
    loadSample?: ((source: any, options?: {}) => Promise<{
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        deltaN: number;
        sampleRate: number;
        duration: number;
        name: string;
        source: string;
        preview: {
            start: number;
            end: number;
            frames: number;
            name: string;
            source: string;
            waveform: number[];
        } | null;
        clock: any;
    }>) | undefined;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraOpl(synth: any, { kind, ...options }?: {
    kind?: string | undefined;
}): Promise<{
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

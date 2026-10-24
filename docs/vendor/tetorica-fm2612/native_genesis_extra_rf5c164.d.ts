export declare const EXTRA_RF5C164_CLOCK_HELD_ERROR = "Release the manually held additional RF5C164 voices before changing the clock";
/** Independent PCM RAM and voices. Only authored uploads and applied register
 * snapshots cross IPC; reading the inspector never downloads waveform RAM. */
export declare function createNativeGenesisExtraRf5c164Endpoint(synth: any, { decodeAudio, fetcher }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
}): {
    client: {
        loadMemory: (bytes: any, address?: number) => Promise<void>;
        loadSample: (source: any, options: any) => Promise<void>;
        setChannel: (ch: any, options: any) => Promise<void>;
        setPitch: (ch: any, step: any) => Promise<void>;
        keyOn: (ch: any) => Promise<void>;
        keyOff: (ch: any) => Promise<void>;
        writeRegister: (r: any, v: any) => Promise<void>;
        reset: () => Promise<void>;
        setClock: (hz: any) => Promise<any>;
        dispose(): void;
    };
    dispatch: (message: any, timing?: {}) => {
        deferred: Promise<{
            id: any;
            value?: boolean | undefined;
        } | undefined>;
    };
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<boolean>;
    loadSample(source: any, options: any): Promise<void>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraRf5c164(synth: any, options?: {}): Promise<{
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

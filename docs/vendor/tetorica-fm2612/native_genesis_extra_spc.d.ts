export declare const EXTRA_SPC_ADMISSION_ERRORS: readonly string[];
export declare const isExtraSpcRejection: (message: any) => any;
export declare function createNativeGenesisExtraSpcEndpoint(synth: any): {
    client: {
        _getState: () => {
            ready: boolean;
            loaded: boolean;
            playing: boolean;
            paused: boolean;
            muteMask: number;
            sampleRate: any;
            nativeSampleRate: number;
            playbackNativeFrames: number;
            positionSeconds: number;
            renderedNativeFrames: number;
        };
        dispose(): void;
    };
    connect(): {
        port: MessagePort;
        node: {
            port: MessagePort;
        };
    };
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraSpc(synth: any, options?: {}): Promise<{
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

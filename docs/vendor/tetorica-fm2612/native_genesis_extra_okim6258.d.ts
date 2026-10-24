import { Oki6258Synth } from './okim6258synth.js';
export declare const EXTRA_OKIM6258_MEMORY_HELD_ERROR = "Release the manually held additional OKIM6258 voices before replacing their sample";
export declare const EXTRA_OKIM6258_CLOCK_HELD_ERROR = "Release the manually held additional OKIM6258 voices before changing the clock";
/** An independent ADPCM decoder and immutable encoded sample. Reads only fetch
 * applied controls and bounded sample metadata, never sample RAM or audio. */
export declare function createNativeGenesisExtraOkim6258Endpoint(synth: any, { decodeAudio, fetcher }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
}): {
    client: Oki6258Synth;
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    loadSample: (source: any, options: any) => Promise<{
        frames: number;
        paddedFrames: number;
        sampleRate: number;
        durationSeconds: number;
        bytes: number;
        name?: any;
    }>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraOkim6258(synth: any, options?: {}): Promise<{
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

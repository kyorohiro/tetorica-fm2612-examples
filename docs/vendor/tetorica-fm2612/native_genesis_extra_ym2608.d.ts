import { YM2608Synth } from './ym2608synth.js';
export declare const EXTRA_YM2608_CLOCK_HELD_ERROR = "Release the manually held additional YM2608 voices before changing the clock";
export declare const EXTRA_YM2608_TIMELINE_BUSY_ERROR = "Native YM2608 timeline already playing or pending";
/** Independently owned OPNA: FM6, SSG3, fixed rhythm6 and ADPCM-B. */
export declare function createNativeGenesisYm2608Endpoint(synth: any, { fetcher, decodeAudio, rhythmRomUrl }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
    rhythmRomUrl?: URL | undefined;
}): {
    client: YM2608Synth;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraYm2608(synth: any, options?: {}): Promise<{
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

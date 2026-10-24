import { YM2610BSynth, NeoGeoFMSynth } from './ym2610bsynth.js';
export declare const EXTRA_YM2610_CLOCK_HELD_ERROR = "Release the manually held additional YM2610 voices before changing the clock";
export declare const EXTRA_YM2610B_CLOCK_HELD_ERROR = "Release the manually held additional YM2610B voices before changing the clock";
/** Independently owned YM2610/B, with immutable mapped FM4 or full FM6. */
export declare function createNativeGenesisYm2610Endpoint(synth: any, { variant }?: {
    variant?: boolean | undefined;
}): {
    client: NeoGeoFMSynth | YM2610BSynth;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraYm2610(synth: any, options?: {}): Promise<{
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
export declare function createNativeGenesisExtraYm2610B(synth: any, options?: {}): Promise<{
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

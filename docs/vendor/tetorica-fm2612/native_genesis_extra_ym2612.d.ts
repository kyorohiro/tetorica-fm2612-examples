import { YM2612Synth } from './ym2612synth.js';
export declare const EXTRA_YM2612_CLOCK_HELD_ERROR = "Release the manually held additional YM2612 voices before changing the clock";
/** Independent FM-only endpoint. No Genesis composite/PSG is allocated. */
export declare function createNativeGenesisYm2612Endpoint(synth: any, { engine: requestedEngine }?: {}): {
    client: YM2612Synth;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraYm2612(synth: any, options?: {}): Promise<{
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

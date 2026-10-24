import { YM2203Synth } from './ym2203synth.js';
export declare const EXTRA_YM2203_CLOCK_HELD_ERROR = "Release the manually held additional YM2203 voices before changing the clock";
export declare const EXTRA_YM2203_SCHEDULE_BUSY_ERROR = "Native YM2203 schedule already playing or pending";
/** One independently owned YM2203: three FM voices and three mono SSG voices. */
export declare function createNativeGenesisYm2203Endpoint(synth: any): {
    client: YM2203Synth;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraYm2203(synth: any, options?: {}): Promise<{
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

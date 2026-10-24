import { GameboySynth } from './gameboysynth.js';
export declare const EXTRA_GAMEBOY_CLOCK_HELD_ERROR = "Release the manually held additional Game Boy voices before changing the clock";
/** Independent callback-owned APU. Public writes retain authoring state; explicit
 * reads inspect applied state without replaying triggers or changing that cache. */
export declare function createNativeGenesisExtraGameboyEndpoint(synth: any): {
    client: GameboySynth;
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraGameboy(synth: any, options?: {}): Promise<{
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

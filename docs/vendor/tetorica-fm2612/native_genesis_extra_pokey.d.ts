import { PokeySynth } from './pokeysynth.js';
export declare const POKEY_TIMELINE_BUSY_ERROR = "Native POKEY timeline is playing or pending";
export declare const POKEY_TIMELINE_HELD_ERROR = "Release the manually held POKEY voices before replacing or playing a timeline";
export declare const EXTRA_POKEY_CLOCK_HELD_ERROR = "Release the manually held additional POKEY voices before changing the clock";
/** Callback-owned four-channel POKEY. This endpoint only transfers controls;
 * the raw DSP and speaker DC boundary run entirely in the Native callback. */
export declare function createNativeGenesisPokeyEndpoint(synth: any, { clock: initialClock, globalName, primary }?: {
    clock?: number | undefined;
    globalName?: string | undefined;
    primary?: boolean | undefined;
}): {
    client: PokeySynth;
    dispatch: (message: any, timing?: {}) => Promise<{
        id: any;
        value: any;
    } | undefined> | {
        deferred: Promise<{
            id: any;
            value: any;
        } | undefined>;
    };
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    stopped(): void;
    reset(): void;
    adoptStopped(): void;
    readonly initialized: boolean;
};
export declare function createNativeGenesisExtraPokey(synth: any, options?: {}): Promise<{
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

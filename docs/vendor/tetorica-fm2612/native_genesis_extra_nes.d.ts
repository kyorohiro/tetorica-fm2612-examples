import { NesApuSynth } from './nesapusynth.js';
export declare const EXTRA_NES_CLOCK_HELD_ERROR = "Release the manually held additional NES voices before changing the clock";
export declare const EXTRA_NES_ADMISSION_ERRORS: readonly string[];
export declare const EXTRA_NES_MEMORY_HELD_ERROR = "Release the manually held additional NES DMC voice before replacing sample memory";
/** Independent APU, DMC RAM and optional FDS. Applied reads never overwrite the
 * author's projected future registers or issue another trigger. */
export declare function createNativeGenesisExtraNesEndpoint(synth: any, { clock: initialClock, fds }?: {
    clock?: number | undefined;
    fds?: boolean | undefined;
}): {
    client: NesApuSynth;
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraNes(synth: any, options?: {}): Promise<{
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

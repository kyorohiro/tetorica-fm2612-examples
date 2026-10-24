import { Huc6280Synth } from './huc6280synth.js';
export declare const EXTRA_HUC6280_CLOCK_HELD_ERROR = "Release the manually held additional HuC6280 voices before changing the clock";
/** Independent six-channel PSG, wave RAM and LFO. Applied reads never replace
 * the author's future register projection or advance hardware pointers. */
export declare function createNativeGenesisExtraHuc6280Endpoint(synth: any, { clock: initialClock }?: {
    clock?: number | undefined;
}): {
    client: Huc6280Synth;
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraHuc6280(synth: any, options?: {}): Promise<{
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

export declare const EXTRA_PSG_CLOCK_HELD_ERROR = "Release the manually held additional PSG voices before changing the clock";
export declare function createNativeGenesisExtraSegaPsg(synth: any, options?: {}): Promise<{
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

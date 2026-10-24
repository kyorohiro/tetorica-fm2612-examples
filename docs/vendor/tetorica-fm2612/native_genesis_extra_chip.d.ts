/** Lifetime and identity for independently owned Native chips. Audio stays on
 * the Native renderer; these ports carry ordered commands and explicit reads. */
export declare function createNativeGenesisExtraChip(synth: any, { id, bridge, kind, label, clock, stereoEnabled, engine, createEndpoint, signal, layout, createArgs }: {
    bridge: any;
    clock: any;
    createArgs?: {} | undefined;
    createEndpoint: any;
    engine: any;
    id: any;
    kind: any;
    label: any;
    layout?: {} | undefined;
    signal: any;
    stereoEnabled: any;
}): Promise<{
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

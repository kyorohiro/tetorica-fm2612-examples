/** Mode endpoints keep stable public clients while Native Stop retires the
 * callback rack. Replacement cores get fresh, increasing instance identities. */
export declare function createNativeGenesisPokeyPrimary(synth: any, { id, globalName, clock }?: {
    clock?: number | undefined;
    globalName?: string | undefined;
    id?: string | undefined;
}): {
    client: import("./pokeysynth.js").PokeySynth;
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
    stopped(): void;
    adoptStopped(): void;
    initialized: boolean;
    id: string;
    globalName: string;
    mix(volume?: number, pan?: number): Promise<void>;
    initialize(): Promise<void>;
    restoreAfterStop(session: any): Promise<void>;
    reset(): void;
};

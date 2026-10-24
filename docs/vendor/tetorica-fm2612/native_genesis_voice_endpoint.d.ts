export declare const nativeInteger: (value: any, max: any, label: any) => any;
export declare function nativeSnapshotArray(values: any, length: any, max: any, label: any): void;
export declare function createNativeVoiceContext(synth: any, { backend, statusCommand, label }: {
    backend: any;
    label: any;
    statusCommand: any;
}): {
    synth: any;
    label: any;
    capture: () => {
        session: any;
        generation: any;
        version: number;
    };
    current: (token: any) => void;
    identity: () => number;
    timed: (chip: any, message: any, timing?: {}) => {
        type: any;
        message: any;
        frame: any;
        performance?: any;
        owner?: any;
    };
    send: (chip: any, message: any, timing?: {}) => void;
    snapshot: (chip: any, args?: {}) => Promise<any>;
    validateHeld: (data: any, max: any) => void;
    enable: (chip: any) => Set<any>;
    disable: (chip: any) => boolean;
    isEnabled: (chip: any) => boolean;
    invalidate: () => void;
};
/** The inspector stages ordinary public API writes before one atomic lease batch. */
export declare function createNativeVoiceEndpoint(context: any, { chip, globalName, client, inspector, translate, adopt, patch, reset, initialize, logical, physical, resetInspector }: {
    adopt: any;
    chip: any;
    client: any;
    globalName: any;
    initialize?: (() => any) | undefined;
    inspector: any;
    logical?: NumberConstructor | undefined;
    patch: any;
    physical?: NumberConstructor | undefined;
    reset: any;
    resetInspector: any;
    translate: any;
}): {
    client: any;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    dispatch: (message: any, timing?: {}) => Promise<{
        id: any;
        value?: boolean | undefined;
    } | undefined>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
    stopped: () => void;
    adoptStopped(data: any): void;
    reset(): void;
};

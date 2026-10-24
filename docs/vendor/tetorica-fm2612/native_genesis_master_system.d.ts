export declare function createNativeGenesisMasterSystem(synth: any): {
    segapsg: {
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
    ym2413: {
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
};

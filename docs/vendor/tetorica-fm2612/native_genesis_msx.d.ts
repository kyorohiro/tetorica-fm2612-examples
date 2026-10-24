export declare function createNativeGenesisMsx(synth: any): {
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
    ay8910: {
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

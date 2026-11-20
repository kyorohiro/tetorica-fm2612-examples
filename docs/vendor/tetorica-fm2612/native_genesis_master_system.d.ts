export declare function createNativeGenesisMasterSystem(synth: any): {
    segapsg: Omit<{
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
    }, "client"> & {
        client: ReturnType<typeof import('./playground_segapsg.js').createSegaPsgClient>;
    };
    ym2413: Omit<{
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
    }, "client"> & {
        client: ReturnType<typeof import('./playground_ym2413.js').createYm2413Client>;
    };
};

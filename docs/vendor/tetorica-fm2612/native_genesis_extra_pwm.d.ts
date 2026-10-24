export declare const EXTRA_PWM_ADMISSION_ERRORS: readonly string[];
export declare function createNativeGenesisExtraPwmEndpoint(synth: any): {
    client: {
        readonly clock: 23011361;
        _getState: () => {
            model: string;
            outputMode: any;
            clock: any;
            sampleRate: any;
            currentFrame: any;
            queuedWrites: any;
        };
        _adoptClock: (hz: any) => void;
        _allocateMainOwner: () => number;
        _withMainOwner(group: any, callback: any): any;
        _cancelMainOwner(group: any): void;
        write: (register: any, value: any) => Promise<any>;
        writeRegister: (register: any, value: any) => Promise<any>;
        read: (register: any) => Promise<any>;
        reset: () => Promise<any>;
        scheduleWrites: (entries: any) => Promise<any>;
        clearSchedule: () => Promise<any>;
        getState: () => Promise<any>;
        setClock: (hz: any) => Promise<any>;
        stopVoices: () => Promise<any>;
        _stopVoices: () => Promise<any>;
        dispose(): void;
    };
    dispatch(message: any, timing?: {}): Promise<{
        id: any;
        value: any;
    } | undefined> | {
        deferred: Promise<{
            id: any;
            value: any;
        } | undefined>;
    };
    read(): Promise<any>;
    invoke(method: any, args?: any[]): Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
export declare function createNativeGenesisExtraPwm(synth: any, options?: {}): Promise<{
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

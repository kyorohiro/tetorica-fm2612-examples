export declare function createNativeGenesisPwm(synth: any): {
    client: {
        id: string;
        write: (register: any, value: any) => Promise<any>;
        writeRegister: (register: any, value: any) => Promise<any>;
        read: (register: any) => Promise<any>;
        reset: () => Promise<any>;
        scheduleWrites: (entries: any) => Promise<any>;
        clearSchedule: () => Promise<any>;
        getState: () => Promise<any>;
        setClock: (hz: any) => Promise<any>;
        dispose(): void;
    };
    dispatch(message: any, timing?: {}): Promise<{
        id: any;
        value: any;
    } | undefined>;
    read(): Promise<any>;
    invoke(method: any, args?: any[]): Promise<any>;
    mix(volume: any, pan: any): any;
    stopped(): void;
    adoptStopped(applied: any): void;
    reset(): void;
};

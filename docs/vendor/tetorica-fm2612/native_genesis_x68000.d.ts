import { Oki6258Synth } from './okim6258synth.js';
export declare function createNativeGenesisX68000(synth: any, { fetcher, decodeAudio, }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
}): {
    ym2151: {
        client: {
            id: string;
            readonly clock: number;
            _adoptClock(hz: any): void;
            _getState(): {
                clock: number;
                registers: number[];
            };
            _adoptState(state: any): void;
            writeRegister: (register: any, value: any) => void;
            reset(): void;
            setOperator(ch: any, operator: any, options: any): void;
            setAlgo(ch: any, algorithm: any, feedback?: number): void;
            setPan(ch: any, left: any, right: any): void;
            setNote(ch: any, note: any): number;
            setFrequency(ch: any, hz: any): {
                keyCode: number;
                keyFraction: number;
            };
            setPitch(ch: any, keyCode: any, keyFraction?: number): void;
            noteOn(ch: any, note: any): void;
            keyOn(ch: any, mask?: number): void;
            keyOff(ch: any): void;
            _forceKeyOff(ch: any): void;
            allNotesOff(): void;
            setNoise(enabled: any, frequency?: number): void;
            dispose(): void;
        };
        initialize: () => Promise<void>;
        mix: (volume?: number, pan?: number) => Promise<void>;
        dispatch: (message: any, timing?: {}) => Promise<{
            id: any;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        stopped: () => void;
        adoptStopped(data: any): void;
        reset(): void;
    };
    okim6258: {
        client: Oki6258Synth;
        initialize: () => Promise<void>;
        mix: (volume?: number, pan?: number) => Promise<void>;
        dispatch: (message: any, timing?: {}) => Promise<{
            id: any;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        loadSample: (source: any, options: any) => Promise<{
            frames: number;
            paddedFrames: number;
            sampleRate: number;
            durationSeconds: number;
            bytes: number;
            name: any;
        }>;
        stopped: () => void;
        adoptStopped(data: any): void;
        reset(): void;
    };
};

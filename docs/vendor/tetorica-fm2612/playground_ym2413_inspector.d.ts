/** Applied YM2413 state. Register reads neither replay controls nor advance audio. */
export declare class Ym2413VoiceInspector {
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    registers: Uint8Array<ArrayBuffer> | undefined;
    /** @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor({ clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    observeWrite(register: any, value: any): void;
    voice(key: any): {
        key: string;
        drum: number;
        physical: number;
    } | {
        drum?: undefined;
        key: any;
        physical: any;
    };
    stage(callback: any, owner: any): any;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        activeSource: string;
        registers: number[];
        channels: {
            channel: number;
            type: string;
            available: boolean;
            active: boolean;
            instrument: number;
            instrumentName: string;
            attenuation: number;
            sustain: boolean;
            fnum: number;
            block: number;
            frequency: number;
            midi: number | null;
        }[];
        userPatch: {
            feedback: number;
            operators: {
                am: boolean;
                vibrato: boolean;
                egt: boolean;
                sustain: boolean;
                ksr: boolean;
                multi: number;
                mul: number;
                ksl: number;
                ar: number;
                dr: number;
                sl: number;
                rr: number;
                waveform: number;
                tl?: number | undefined;
            }[];
            bytes: number[];
            shared: boolean;
        };
        rhythm: {
            enabled: boolean;
            levels: {
                bassDrum: number;
                snare: number;
                tom: number;
                cymbal: number;
                hiHat: number;
            };
        };
        keyboardChannels: import("./playground_keyboard_channels.js").PlaygroundKeyboardChannel[];
        held: any[];
    };
}

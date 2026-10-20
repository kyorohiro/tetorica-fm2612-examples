/** Applied AY state; no inspection path renders audio or replays controls. */
export declare class Ay8910VoiceInspector {
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    registers: Uint8Array<ArrayBuffer> | undefined;
    levels: number[] | undefined;
    /** @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor({ clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    observeWrite(register: any, value: any): void;
    getState(): {
        registers: number[];
        levels: any[];
    };
    stage(callback: any, owner: any): any;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        registers: number[];
        channels: {
            channel: number;
            type: string;
            period: number;
            frequency: number;
            midi: number;
            toneEnabled: boolean;
            noiseEnabled: boolean;
            volume: number;
            envelope: boolean;
            configuredVolume: number;
            configuredEnvelope: boolean;
            active: boolean;
        }[];
        noise: {
            period: number;
            frequency: number;
        };
        envelope: {
            period: number;
            shape: number;
            frequency: number;
            continue: boolean;
            attack: boolean;
            alternate: boolean;
            hold: boolean;
        };
        keyboardChannels: import("./playground_keyboard_channels.js").PlaygroundKeyboardChannel[];
        held: any[];
    };
}

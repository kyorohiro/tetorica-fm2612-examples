export declare class PokeyVoiceInspector {
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
        clock: number;
        initialized: boolean;
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
            period: number;
            frequency: number;
            joined: boolean;
            helper: boolean;
            highClock: boolean;
            distortion: number;
            volume: number;
            configuredVolume: number;
            volumeOnly: boolean;
            active: boolean;
        }[];
        keyboardChannels: import("./playground_keyboard_channels.js").PlaygroundKeyboardChannel[];
        held: any[];
    };
}

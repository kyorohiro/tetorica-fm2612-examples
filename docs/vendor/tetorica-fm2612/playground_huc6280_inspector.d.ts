/** Applied register/RAM mirror. No reads advance the chip or change its latch. */
export declare class Huc6280VoiceInspector {
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    selected: number | undefined;
    globals: Uint8Array<ArrayBuffer> | undefined;
    registers: Uint8Array<ArrayBuffer>[] | undefined;
    waveforms: Uint8Array<ArrayBuffer>[] | undefined;
    indices: Uint8Array<ArrayBuffer> | undefined;
    pointerKnown: Uint8Array<ArrayBuffer> | undefined;
    waveformKnown: Uint8Array<ArrayBuffer> | undefined;
    knownSamples: Uint32Array<ArrayBuffer> | undefined;
    ddaValues: Uint8Array<ArrayBuffer> | undefined;
    /** @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor({ clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    observeWrite(register: any, value: any): void;
    observeRendered(): void;
    stage(callback: any, owner: any, preserveOwner?: boolean): any;
    frequency(stage: any, ch: any, hz: any): number;
    period(stage: any, ch: any, period: any): void;
    waveform(stage: any, ch: any, values: any): void;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        activeSource: string;
        selectedChannel: number | undefined;
        masterVolume: {
            left: number;
            right: number;
        };
        lfo: {
            frequency: number;
            depth: number;
            reset: boolean;
        };
        globals: number[];
        channels: {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            dda: boolean;
            ddaValue: number;
            volume: number;
            pan: {
                left: number;
                right: number;
            };
            period: number;
            frequency: number;
            waveform: number[];
            waveformKnown: boolean;
            waveformPointer: number | null;
            noise: {
                enabled: boolean;
                frequency: number;
            } | null;
            registers: number[];
        }[];
    };
}

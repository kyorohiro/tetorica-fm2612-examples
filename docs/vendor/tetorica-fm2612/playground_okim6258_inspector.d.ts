/** Applied single-stream state. Reads never decode memory, write, or advance audio. */
export declare class Oki6258VoiceInspector {
    stream: import("./okim6258synth.js").Oki6258Stream;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    audition: any;
    previewSequence: number;
    sample: {
        name: any;
        bytes: number;
        frames: number;
        sampleRate: any;
        durationSeconds: number;
        waveform: any;
        source: any;
    } | null;
    memoryRevision: number;
    /**
     * @param {import('./okim6258synth.js').Oki6258Stream} stream
     * @param {Omit<import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions, 'clock'>} [options]
     */
    constructor(stream: import('./okim6258synth.js').Oki6258Stream, { sampleRate, dispatch, beginAudition, endAudition }?: Omit<import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions, 'clock'>);
    held(): boolean;
    owner(): string | undefined;
    resetAudition(): void;
    loadMemory(bytes: any, metadata?: {}): {
        name: any;
        bytes: number;
        frames: number;
        sampleRate: any;
        durationSeconds: number;
        source: any;
        waveform: any;
    };
    stage(commands: any): void;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        divider: number;
        playbackRate: number;
        pan: {
            left: boolean;
            right: boolean;
        };
        playing: boolean;
        streaming: boolean;
        repeat: boolean;
        positionFrames: number;
        fedBytes: number;
        memoryRevision: number;
        sample: {
            name: any;
            bytes: number;
            frames: number;
            sampleRate: any;
            durationSeconds: number;
            source: any;
            waveform: any;
        } | null;
        channels: {
            channel: number;
            type: string;
            active: boolean;
        }[];
    };
}

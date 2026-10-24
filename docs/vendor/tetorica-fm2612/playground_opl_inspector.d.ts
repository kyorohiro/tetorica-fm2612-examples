/** Applied OPL registers. Reads never write audio or advance chip time. */
export declare class OplVoiceInspector {
    kind: import("./opl_synth.js").OPLChip;
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    sampleEpoch: any;
    registers: Uint8Array<ArrayBuffer> | undefined;
    adpcmMemory: any;
    /** @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {chip?:import('./opl_synth.js').OPLChip}} [options] */
    constructor({ chip, clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {
        chip?: import('./opl_synth.js').OPLChip;
    });
    resetAuditions(): void;
    reset(): void;
    /** @param {{memoryBytes:number,revision:number,preview?:import('./y8950_adpcm.js').Y8950AdpcmPreview|null}} [options] */
    setAdpcmMemoryInfo({ memoryBytes, revision, preview }?: {
        memoryBytes: number;
        revision: number;
        preview?: import('./y8950_adpcm.js').Y8950AdpcmPreview | null;
    }): void;
    observeWrite(register: any, value: any, bank?: number): void;
    stage(callback: any, owner: any): any;
    paired(ch: any): any;
    channel(ch: any): any;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: import("./opl_synth.js").OPLChip;
        clock: number;
        sampleRate: number;
        activeSource: string;
        registers: number[];
        channels: {
            channel: number;
            type: string;
            active: boolean;
            available: boolean;
            fnum: number;
            block: number;
            frequency: number;
            midi: number | null;
            algorithm: number;
            feedback: number;
            pan: {
                left: boolean;
                right: boolean;
            };
            fourOp: boolean;
            pairedWith: number | null;
            operators: {
                am: boolean;
                vibrato: boolean;
                egt: boolean;
                sustain: boolean;
                ksr: boolean;
                multi: number;
                mul: number;
                ksl: number;
                tl: number;
                ar: number;
                dr: number;
                sl: number;
                rr: number;
                waveform: number;
            }[];
        }[];
        rhythm: {
            enabled: boolean;
            bassDrum: boolean;
            snare: boolean;
            tom: boolean;
            cymbal: boolean;
            hiHat: boolean;
        };
        lfo: {
            amDepth: boolean;
            pmDepth: boolean;
        };
        keyboardChannels: import("./playground_keyboard_channels.js").PlaygroundKeyboardChannel[];
        held: any[];
        adpcm?: {
            start: number;
            end: number;
            deltaN: number;
            playbackRate: number;
            volume: any;
            repeat: boolean;
            playing: boolean;
            activeSource: string;
            addressUnit: number;
            memorySize: number;
            memoryRevision: number;
            validRange: boolean;
            waveformKnown: boolean;
            waveform: any;
            sampleName: any;
            sampleEpoch: any;
        } | undefined;
    };
}

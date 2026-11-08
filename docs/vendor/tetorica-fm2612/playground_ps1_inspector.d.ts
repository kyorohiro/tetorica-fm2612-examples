/** Applied instrument state and identity-safe manual channel leases. Reads do not render. */
export declare class Ps1VoiceInspector {
    synth: import("./ps1synth.js").Ps1Synth;
    sampleRate: number;
    dispatch: (command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    onResourcesChanged: () => void;
    auditions: Map<any, any>;
    /** @param {import('./ps1synth.js').Ps1Synth} synth @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {onResourcesChanged?:()=>void}} [options] */
    constructor(synth: import('./ps1synth.js').Ps1Synth, { sampleRate, dispatch, beginAudition, endAudition, onResourcesChanged }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {
        onResourcesChanged?: () => void;
    });
    resetAuditions(): void;
    read(): {
        channelCount: number;
        nextAddress: number;
        nativeFrames: number;
        samples: {
            id: number;
            startAddress: number;
            repeatAddress: number;
            byteLength: number;
            decodedFrames: number;
            rootNote: string | number | null;
            rootFrequencyHz: number;
            basePitch: number;
            loop: boolean;
            loopStartSamples: number | null;
            editorChannel?: number;
        }[];
        reverb: {
            preset: import("./ps1_parameters.js").Ps1ReverbPreset;
            volumeLeft: number;
            volumeRight: number;
        };
        channels: {
            sample: number | null;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            pitch: number;
            reverb: boolean;
            waveform: {
                sample: number;
                pcm: number[];
            } | null;
            envelopeParameters: import("./ps1_parameters.js").Ps1Envelope;
            gate: boolean;
            envelope: number;
            ended: boolean;
            channel: number;
            active: boolean;
            type: string;
        }[];
        kind: string;
        sampleRate: number;
        nativeSampleRate: number;
        auditions: {
            channel: any;
            id: any;
        }[];
    };
    invoke(method: any, args?: any[]): boolean | import("./ps1synth.js").Ps1Sample;
}

/** Applied DSP settings and manual channel leases. No sample is created here.
 * Reading never renders or changes the current instrument/timeline.
 */
export declare class SnesVoiceInspector {
    synth: import("./snessynth.js").SnesSynth;
    sampleRate: number;
    dispatch: (command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    gates: number;
    assignedSamples: Map<any, any>;
    /** @param {import('./snessynth.js').SnesSynth} synth
     * @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor(synth: import('./snessynth.js').SnesSynth, { sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    observeWrite(register: any, value: any): void;
    resetAuditions(): void;
    voice(ch: any): {
        sample: any;
        adsr1: number;
        adsr2: number;
        gain: number;
        volumeLeft: any;
        volumeRight: any;
        pitch: number;
    };
    read(): {
        kind: string;
        sampleRate: number;
        nativeSampleRate: number;
        activeSource: string;
        samples: import("./snessynth.js").SnesSample[];
        channels: {
            sample: any;
            adsr1: number;
            adsr2: number;
            gain: number;
            volumeLeft: any;
            volumeRight: any;
            pitch: number;
            channel: number;
            type: string;
            active: boolean;
            frequency: number | null;
        }[];
        auditions: {
            channel: any;
            id: any;
        }[];
        timeline: {
            loaded: boolean;
            positionFrames: number;
            totalFrames: number;
            ended: boolean;
            playing: boolean;
        };
    };
    invoke(method: any, args?: any[]): boolean;
}

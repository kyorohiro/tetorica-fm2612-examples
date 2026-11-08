/** PS1 register authoring and instrument metadata stay in JavaScript. The SPU,
 * sample RAM, envelopes, reverb and resampling execute on the Native callback. */
import { Ps1Synth } from './ps1synth.js';
export declare const PS1_MEMORY_HELD_ERROR = "Release the manually held PS1 voice before replacing its sample RAM or state";
export declare const PS1_STATE_HELD_ERROR = "Release the manually held PS1 voice before replacing its sample RAM or state";
export declare const PS1_ADMISSION_ERRORS: readonly string[];
export declare const nativePs1Controls: Set<string>;
export declare function createNativePs1Shadow(): {
    registers: Uint16Array<ArrayBuffer>;
    synth: Ps1Synth;
    collect(method: any, args?: any[]): any[];
};
/** Translate only the changed fields, so an edit cannot overwrite a separately
 * scheduled pitch, envelope or sibling reverb-send bit. */
export declare function nativePs1Operations(target: any, method: any, args?: any[], { partial }?: {
    partial?: boolean | undefined;
}): any;
export declare function createNativeGenesisPs1(owner: any, { additional }?: {
    additional?: boolean | undefined;
}): {
    client: {
        id: string;
        sampleRate: any;
        nativeSampleRate: number;
        channelCount: number;
        _getState: () => {
            sampleRate: number;
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
            }[];
            stateRevision: number;
        };
        _adoptState(): boolean;
        _allocateMainOwner: () => number;
        _withMainOwner(group: any, callback: any): any;
        _cancelMainOwner(group: any): void;
        _stopVoices(): Promise<void>;
        loadADPCM: (input: any, options: any, timing?: {}) => Promise<{
            id?: number | undefined;
            startAddress?: number | undefined;
            repeatAddress?: number | undefined;
            byteLength?: number | undefined;
            decodedFrames?: number | undefined;
            rootNote?: string | number | null | undefined;
            rootFrequencyHz?: number | undefined;
            basePitch?: number | undefined;
            loop?: boolean | undefined;
            loopStartSamples?: number | null | undefined;
            editorChannel?: number;
        }>;
        getState: () => Promise<import("./ps1synth.js").Ps1VoiceState | {
            sampleRate: number;
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
            }[];
        } | {
            sampleRate: number;
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
            }[];
            ram: Uint8Array<ArrayBuffer>;
            registers: Uint16Array<ArrayBuffer>;
        }>;
        getPreset: (ch: any) => Promise<import("./ps1synth.js").Ps1VoiceState | {
            sampleRate: number;
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
            }[];
        } | {
            sampleRate: number;
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
            }[];
            ram: Uint8Array<ArrayBuffer>;
            registers: Uint16Array<ArrayBuffer>;
        }>;
        snapshot: () => Promise<import("./ps1synth.js").Ps1VoiceState | {
            sampleRate: number;
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
            }[];
        } | {
            sampleRate: number;
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
            }[];
            ram: Uint8Array<ArrayBuffer>;
            registers: Uint16Array<ArrayBuffer>;
        }>;
        dispose(): void;
    };
    dispatch: (message: any, timing?: {}) => {
        deferred: Promise<{
            id: any;
            value: void | boolean | import("./ps1synth.js").Ps1VoiceState | {
                sampleRate: number;
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
                }[];
            } | {
                id?: number | undefined;
                startAddress?: number | undefined;
                repeatAddress?: number | undefined;
                byteLength?: number | undefined;
                decodedFrames?: number | undefined;
                rootNote?: string | number | null | undefined;
                rootFrequencyHz?: number | undefined;
                basePitch?: number | undefined;
                loop?: boolean | undefined;
                loopStartSamples?: number | null | undefined;
                editorChannel?: number;
            } | {
                sampleRate: number;
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
                }[];
                ram: Uint8Array<ArrayBuffer>;
                registers: Uint16Array<ArrayBuffer>;
            };
        } | undefined>;
    };
    invoke: (method: any, args?: any[]) => Promise<boolean | import("./ps1synth.js").Ps1Sample | {
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
    }>;
    read(): Promise<{
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
    }>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    stopped: () => void;
    adoptStopped(data: any): any;
    reset(): void;
};

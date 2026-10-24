/** Game Boy / PC Engine controls for callback-owned Native cores; no audio graph. */
import { GameboySynth } from './gameboysynth.js';
import { Huc6280Synth } from './huc6280synth.js';
export declare function createNativeGenesisConsole(synth: any, kind: any): {
    client: GameboySynth | Huc6280Synth;
    dispatch: (message: any, timing?: {}) => Promise<{
        id: any;
        value: boolean;
    } | undefined>;
    read: ({ after }?: {
        after?: number;
    }) => Promise<import("./playground_native_voice_inspector.js").GameboyVoiceSnapshot | {
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
    }>;
    invoke(method: any, args?: any[]): Promise<any>;
    initialize(): void;
    mix(volume: any, pan: any): any;
    stopped(): void;
    adoptStopped(snapshot: any): import("./playground_native_voice_inspector.js").GameboyVoiceSnapshot | {
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
    reset(): void;
};

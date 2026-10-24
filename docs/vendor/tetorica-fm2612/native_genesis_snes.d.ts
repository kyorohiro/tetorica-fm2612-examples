/** SNES instruments use JS for register generation; DSP and RAM live natively. */
import { SnesSynth } from './snessynth.js';
export declare const nativeSnesControls: Set<string>;
export declare function createNativeSnesShadow(): {
    synth: SnesSynth;
    registers: Uint8Array<ArrayBuffer>;
    collect(method: any, args?: any[]): any[];
};
export declare function nativeSnesOperations(target: any, method: any, args: any, { partial }?: {
    partial?: boolean | undefined;
}): any;
export declare function createNativeGenesisSnes(owner: any): {
    client: {
        id: string;
        sampleRate: number;
        nativeSampleRate: number;
        _getState: () => import("./snessynth.js").SnesState;
        _adoptState(state: any): void;
        _stopVoices: () => any;
        dispose(): void;
        loadBRR(input: any, options: any): Promise<any>;
        readDsp(register: any): Promise<any>;
        getState(): Promise<import("./snessynth.js").SnesState>;
        getPreset(channel: any): Promise<import("./snessynth.js").SnesVoiceState>;
        snapshot(): Promise<{
            ram: Uint8Array<ArrayBuffer>;
            dsp: Uint8Array<ArrayBuffer>;
            nativeFrames: any;
        }>;
        prepareTimeline: (trace: any) => Promise<any>;
        playTimeline: () => Promise<any>;
        stopTimeline: () => Promise<any>;
        getTimelineState(): Promise<any>;
    };
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<{
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
    }>;
    invoke(method: any, args?: any[]): Promise<boolean>;
    initialize(): void;
    mix(volume: any, pan: any): any;
    stopped(): void;
    adoptStopped(data: any): {
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
    reset(): void;
};

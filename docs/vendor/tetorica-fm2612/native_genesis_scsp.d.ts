import { ScspSynth } from './scspsynth.js';
export declare const SCSP_MEMORY_HELD_ERROR = "Stop SCSP voices before replacing protected sample RAM or state";
export declare const SCSP_ADMISSION_ERRORS: string[];
export declare function createNativeScspShadow(): {
    synth: ScspSynth;
    core: {
        sampleRate: number;
        nativeFrames: number;
        reset({ clearRam }?: {
            clearRam?: boolean | undefined;
        }): void;
        write(register: any, value: any, mask?: number): void;
        read: (register: any) => number;
        loadRam(bytes: any, address?: number): void;
        readRam: (address: any, length: any) => any;
        renderInto(): never;
        dispose(): void;
    };
    registers: Uint16Array<ArrayBuffer>;
    readonly ram: any;
    collect(method: any, args?: any[]): {
        commands: any[];
        value: any;
    };
};
export declare function createNativeGenesisScsp(owner: any, { additional }?: {
    additional?: boolean | undefined;
}): {
    client: {
        id: string;
        sampleRate: any;
        nativeSampleRate: number;
        channelCount: number;
        _getState: () => {
            sampleRate: number;
            bankId: string;
            nextSampleId: number;
            ramUsedBytes: number;
            ramFreeBytes: number;
            playingFrequencies: any[];
            playingLfos: any[];
            playingModulations: any[];
            playingSampleIds: any[];
            samples: any[];
            slots: {
                sample: null;
                frequencyHz: number;
                totalLevel: number;
                directLevel: number;
                pan: number;
                envelope: {
                    attackRate: number;
                    decay1Rate: number;
                    decay2Rate: number;
                    decayLevel: number;
                    releaseRate: number;
                    keyRateScaling: number;
                };
                lfo: {
                    frequencyCode: number;
                    pitchWave: number;
                    pitchDepth: number;
                    amplitudeWave: number;
                    amplitudeDepth: number;
                    reset: boolean;
                };
                modulation: {
                    depth: number;
                    xOffset: number;
                    yOffset: number;
                    writeInhibit: boolean;
                };
                gate: any;
            }[];
            stateRevision: number;
        };
        _adoptState(): void;
        _allocateMainOwner: () => number;
        _withMainOwner(scope: any, callback: any): any;
        _cancelMainOwner(scope: any): void;
        _stopVoices: () => Promise<any>;
        loadPCM: (input: any, options: any, timing?: {}) => Promise<any>;
        getState: () => Promise<any>;
        dispose(): void;
    };
    invoke: (method: any, args?: any[]) => Promise<any>;
    read(): Promise<any>;
    dispatch(message: any, timing?: {}): {
        deferred: Promise<{
            id: any;
            value: any;
            state?: {
                sampleRate: number;
                bankId: string;
                nextSampleId: number;
                ramUsedBytes: number;
                ramFreeBytes: number;
                playingFrequencies: any[];
                playingLfos: any[];
                playingModulations: any[];
                playingSampleIds: any[];
                samples: any[];
                slots: {
                    sample: null;
                    frequencyHz: number;
                    totalLevel: number;
                    directLevel: number;
                    pan: number;
                    envelope: {
                        attackRate: number;
                        decay1Rate: number;
                        decay2Rate: number;
                        decayLevel: number;
                        releaseRate: number;
                        keyRateScaling: number;
                    };
                    lfo: {
                        frequencyCode: number;
                        pitchWave: number;
                        pitchDepth: number;
                        amplitudeWave: number;
                        amplitudeDepth: number;
                        reset: boolean;
                    };
                    modulation: {
                        depth: number;
                        xOffset: number;
                        yOffset: number;
                        writeInhibit: boolean;
                    };
                    gate: any;
                }[];
                stateRevision: number;
            } | undefined;
        } | undefined>;
    };
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    stopped: () => void;
    adoptStopped(data: any): any;
    reset(): void;
};

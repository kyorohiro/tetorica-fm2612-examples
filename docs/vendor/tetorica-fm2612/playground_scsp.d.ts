import { ScspSynth } from './scspsynth.js';
export declare const SCSP_CONTROLS: readonly string[];
export declare function createScspValidation(): ScspSynth;
/** Resolve cloned handles only at a transport boundary. Numeric IDs alone are
 * deliberately insufficient: two SCSP instances can allocate the same ID. */
export declare function scspCommandArgs(synth: any, method: any, args: any): any;
/** Ordered Main/Worker facade; waveform upload/state reads are asynchronous. */
export declare function createScspClient(port: any, initial?: {}, lifecycle?: {}): {
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
    };
    _setLifecycle: (options: any) => void;
    _applyAuthorEdit: (edit: any) => void;
    _adoptState: (state: any) => void;
    _stopVoices: () => Promise<any>;
    loadPCM(input: any, options: any): Promise<any>;
    getState: () => Promise<any>;
    dispose(): void;
};

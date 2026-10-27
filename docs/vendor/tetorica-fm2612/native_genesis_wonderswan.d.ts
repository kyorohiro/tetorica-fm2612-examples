import { WonderSwanSynth } from './wonderswansynth.js';
export declare const WONDERSWAN_CLOCK_HELD_ERROR = "Release the manually held WonderSwan voices before changing the clock";
export declare const WONDERSWAN_CLOCK_PENDING_ERROR = "WonderSwan clock change is scheduled; audition after it is applied";
export declare const WONDERSWAN_TIMELINE_BUSY_ERROR = "Native WonderSwan timeline is playing or pending";
export declare const WONDERSWAN_TIMELINE_HELD_ERROR = "Release the manually held WonderSwan voices before replacing or playing a timeline";
/** Commands and explicit snapshots only. The Native callback owns the core,
 * wave RAM, speaker centering and every sample of audio. */
export declare function createNativeGenesisWonderSwan(synth: any, { extra, clock: initialClock }?: {
    clock?: number | undefined;
    extra?: boolean | undefined;
}): {
    client: WonderSwanSynth;
    dispatch: (message: any, timing?: {}) => any;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    cancelOwner: (performance: any, owner: any) => void;
    cancelPerformance: (performance: any) => void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    stopped(): void;
    adoptStopped(data: any): void;
    reset(): void;
};

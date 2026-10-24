/** PC-98 authoring stays in the shared YM2608 helpers; Native owns synthesis. */
import { YM2608Synth } from './ym2608synth.js';
export declare function createNativeGenesisYm2608(synth: any, { fetcher, decodeAudio, rhythmRomUrl, }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
    rhythmRomUrl?: URL | undefined;
}): {
    client: YM2608Synth;
    dispatch: (message: any, timing?: {}) => Promise<{
        type: string;
        id: any;
        clock: number;
    } | {
        clock?: undefined;
        id: any;
        type?: string | undefined;
        value?: boolean | undefined;
    } | undefined>;
    read: (args?: {}) => Promise<any>;
    auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
    auditionNoteOff: (channel: any, voice: any) => Promise<void>;
    invoke(method: any, args?: any[]): Promise<any>;
    initialize(): Promise<any>;
    loadSample(source: any, options?: {}): Promise<{
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        sampleRate: number;
        deltaN: number;
        duration: number;
        name?: any;
    }>;
    mix(volume: any, pan: any): Promise<void>;
    stopped: () => void;
    adoptStopped(data: any): any;
    reset(): void;
};

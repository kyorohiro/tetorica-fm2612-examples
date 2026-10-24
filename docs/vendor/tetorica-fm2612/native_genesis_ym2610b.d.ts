/** Neo Geo authoring stays in the shared YM2610/B helpers; Native owns synthesis. */
import { YM2610BSynth, NeoGeoFMSynth } from './ym2610bsynth.js';
export declare function createNativeGenesisYm2610B(synth: any, { variant, fetcher, decodeAudio, }?: {
    decodeAudio?: ((bytes: any) => Promise<any>) | undefined;
    fetcher?: typeof fetch | undefined;
    variant?: boolean | undefined;
}): {
    client: NeoGeoFMSynth | YM2610BSynth;
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
    loadSample(source: any, options?: {}): Promise<any>;
    mix(volume: any, pan: any): Promise<void>;
    stopped: () => void;
    adoptStopped(data: any): any;
    reset(): void;
};

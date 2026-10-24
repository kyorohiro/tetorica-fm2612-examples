/** PC-98 YM2203 authoring shares the Web FM/SSG helpers; Native renders mono. */
import { YM2203Synth } from './ym2203synth.js';
export declare function createNativeGenesisYm2203(synth: any): {
    client: YM2203Synth;
    dispatch: (message: any, timing?: {}) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[]) => Promise<any>;
    auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
    auditionNoteOff: (channel: any, voice: any) => Promise<void>;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    stopped: () => void;
    adoptStopped(data: any): any;
    reset(): void;
};

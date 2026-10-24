import { Oki6258Synth } from './okim6258synth.js';
/** Main/Worker API; samples and playback commands share one ordered port. */
export declare function createOki6258Client(port: any, options?: {}, lifecycle?: {}): Oki6258Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

import { Oki6258Synth } from './okim6258synth.js';
/** Main/Worker API; samples and playback commands share one ordered port. */
export declare function createOki6258Client(port: any, { clock }?: {
    clock?: number | undefined;
}): Oki6258Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
};

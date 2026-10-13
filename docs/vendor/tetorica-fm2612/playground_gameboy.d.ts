import { GameboySynth } from './gameboysynth.js';
/** Same immediate, ordered port writes for both raw and high-level APIs. */
/** @param {MessagePort} port */
export declare function createGameboyClient(port: MessagePort): GameboySynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
};

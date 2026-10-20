import { GameboySynth } from './gameboysynth.js';
/** Same immediate, ordered port writes for both raw and high-level APIs. */
/** @param {MessagePort} port */
export declare function createGameboyClient(port: MessagePort): GameboySynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};
/** Safe builtin controls borrow the primary device, whose lifetime belongs to the runtime. */
export declare function createPrimaryGameboyApi(raw: any): {
    pulse: any;
    wave: any;
    noise: any;
};

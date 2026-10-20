/** Shared main-thread / Worker facade; register writes and memory transfers share one ordered port. */
import { YM2608Synth } from './ym2608synth.js';
/** @param {MessagePort} port */
export declare function createYm2608Client(port: MessagePort): YM2608Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
};

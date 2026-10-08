/** Worker/Node: performance state and FM/PSG register generation.
 * No DOM, AudioNode or main-thread RPC. Observers are fire-and-forget.
 */
import { YM2612Synth } from './ym2612synth.js';
import { OPNFMSynth } from './opn_fm_synth.js';
export declare function createWorkerChip({ port, capabilities, state, observe }: {
    capabilities: any;
    observe?: (() => void) | undefined;
    port: any;
    state: any;
}): {
    fm: {};
    psg: {
        [k: string]: any;
    } | null;
    raw: OPNFMSynth | YM2612Synth;
    send: (command: any) => void;
    adoptState: (state: any) => void;
    resume(): void;
    write(...args: any[]): any;
    stop(): void;
};

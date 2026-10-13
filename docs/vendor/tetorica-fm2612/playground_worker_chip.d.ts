/** Worker/Node: performance state and FM/PSG register generation.
 * No DOM, AudioNode or main-thread RPC. Observers are fire-and-forget.
 */
import { YM2612Synth } from './ym2612synth.js';
import { OPNFMSynth } from './opn_fm_synth.js';
/**
 * Create Worker-side FM/PSG controls that batch ordered writes to a Worklet port.
 * Stop cancels outstanding DAC requests and mutes hardware; resume permits new work.
 * @param {{port: MessagePort, capabilities: {chip?: 'ym2612' | 'ym2203' | 'ym2610', fmChannels?: number, psg?: boolean, dac?: boolean}, state?: {channels: object[], lfo: object, modeRegister?: number, dac?: object}, observe?: (event: {method: string, args: unknown[]}) => void}} options Port, chip capabilities, optional snapshot and observer.
 * @returns FM/PSG controls, raw synth state, write sender and lifecycle methods.
 */
export declare function createWorkerChip({ port, capabilities, state, observe }: {
    port: MessagePort;
    capabilities: {
        chip?: 'ym2612' | 'ym2203' | 'ym2610';
        fmChannels?: number;
        psg?: boolean;
        dac?: boolean;
    };
    state?: {
        channels: object[];
        lfo: object;
        modeRegister?: number;
        dac?: object;
    };
    observe?: (event: {
        method: string;
        args: unknown[];
    }) => void;
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

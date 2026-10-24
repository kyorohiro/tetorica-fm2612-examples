/** Worker/Node: selected-primary performance state and register generation.
 * No DOM, AudioNode or main-thread RPC. Observers are fire-and-forget.
 */
import { GameboySynth } from './gameboysynth.js';
import { YM2612Synth } from './ym2612synth.js';
import { OPNFMSynth } from './opn_fm_synth.js';
/**
 * Create Worker-side primary controls that send ordered writes to a Worklet port.
 * Stop cancels outstanding DAC requests and mutes hardware; resume permits new work.
 * @param {{port: MessagePort, capabilities: {backend?:string,chip?: 'ym2612' | 'ym2203' | 'ym2608' | 'ym2610' | 'ym2610b' | 'gameboy', fmChannels?: number, psg?: boolean, dac?: boolean}, state?: {clock?:number, channels?:object[], lfo?:object, modeRegister?:number, dac?:object, initialized?:boolean, registers?:number[], voice?:number[]}, observe?: (event: {method: string, args: unknown[]}) => void}} options Port, chip capabilities, optional snapshot and observer.
 * @returns Selected primary controls, raw synth state, write sender and lifecycle methods.
 */
export declare function createWorkerChip({ port, capabilities, state, observe }: {
    port: MessagePort;
    capabilities: {
        backend?: string;
        chip?: 'ym2612' | 'ym2203' | 'ym2608' | 'ym2610' | 'ym2610b' | 'gameboy';
        fmChannels?: number;
        psg?: boolean;
        dac?: boolean;
    };
    state?: {
        clock?: number;
        channels?: object[];
        lfo?: object;
        modeRegister?: number;
        dac?: object;
        initialized?: boolean;
        registers?: number[];
        voice?: number[];
    };
    observe?: (event: {
        method: string;
        args: unknown[];
    }) => void;
}): {
    adpcm: any;
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
} | {
    gameboy: {
        pulse: any;
        wave: any;
        noise: any;
    };
    raw: GameboySynth;
    send: (command: any) => void;
    adoptState: (state: any) => void;
    resume(): void;
    stop(): void;
};

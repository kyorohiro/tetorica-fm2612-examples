/**
 * @file FM helpers for the additional OPN cores.
 * 実行環境: Browser / Node.js。依存: 注入されたレジスタ transport。Web Audio は不要。
 * FM only: no rhythm/SSG presets or browser RuntimeSynth are added here.
 */
import { OPNFMSynth } from './opn_fm_synth.js';
/** YM3438 FM programming uses the shared six-channel OPN register interface. */
export declare class YM3438Synth extends OPNFMSynth {
    /** @param {{transport: Object}} options Register transport, e.g. OPNDirectTransport. */
    constructor({ transport }?: {
        transport: Object;
    });
}
/** YMF276 has its own native output path, with the same FM programming interface. */
export declare class YMF276Synth extends OPNFMSynth {
    /** @param {{transport: Object}} options Register transport. */
    constructor({ transport }?: {
        transport: Object;
    });
}
/** YMF288 FM-only helper. SSG and rhythm are outside the preset API. CSM is unavailable. */
export declare class YMF288Synth extends OPNFMSynth {
    /** @param {{transport: Object}} options Register transport. */
    constructor({ transport }?: {
        transport: Object;
    });
    /** Reset and enable FM channels 4..6, which are disabled by the core's reset state. */
    reset(): void;
}

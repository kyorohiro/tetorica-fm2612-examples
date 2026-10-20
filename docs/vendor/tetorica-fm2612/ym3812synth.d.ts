import { OPLSynth, OPLDirectTransport } from './opl_synth.js';
export { OPL_PRESETS } from './opl_synth.js';
export { YM3812_CLOCK } from './ym3812.js';
export { YM3812WorkletTransport } from './chip_worklet_transport.js';
/** Nine-channel OPL2 instrument API; channels and operators are zero-based. */
export declare class YM3812Synth extends OPLSynth {
    /** @param {{transport:import('./opl_synth.js').OPLTransport,clock?:number}} options */
    constructor({ transport, clock }?: {
        transport: import('./opl_synth.js').OPLTransport;
        clock?: number;
    });
}
/** Borrow a synchronous YM3812 without creating an audio device. */
export declare class YM3812DirectTransport extends OPLDirectTransport {
    /** @param {import('./ym3812.js').Ym3812} chip @param {{clock?:number}} [options] */
    constructor(chip: import('./ym3812.js').Ym3812, { clock }?: {
        clock?: number;
    });
}

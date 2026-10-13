/**
 * @file ym2203synth.js
 * 実行環境: Browser / Node.js（クラスにより異なる）
 * 依存: 低レベル Synth / DirectTransport は注入したチップで動作し、Node.js でも使用可能。
 * RuntimeSynth 系の実再生は OPNRuntimeSynth 経由で AudioContext / AudioWorkletNode / fetch を使う。
 */
import { SSGSynth } from "./ssgsynth.js";
import { OPNDirectTransport, OPNFMSynth } from "./opn_fm_synth.js";
import { OPNRuntimeSynth } from "./opn_runtime_synth.js";
/** Direct transport for YM2203 FM and SSG registers. */
/** @extends {OPNDirectTransport<import('./ym2203.js').Ym2203>} */
export declare class YM2203DirectTransport extends OPNDirectTransport<import('./ym2203.js').Ym2203> {
    /** @param {import('./ym2203.js').Ym2203} chip */
    constructor(chip: import('./ym2203.js').Ym2203);
}
/** YM2203 FM (including CH3 special) and its three-channel SSG. */
export declare class YM2203Synth extends OPNFMSynth {
    ssg: SSGSynth;
    /** @param {{transport: import('./opn_fm_synth.js').OPNTransport, clock?: number}} options
     * clock is the master clock in Hz; frequency helpers assume the standard prescaler.
     */
    constructor({ transport, clock }?: {
        transport: import('./opn_fm_synth.js').OPNTransport;
        clock?: number;
    });
    reset(): void;
    /** @param {number} port
     * @param {number} value
     * @param {number} register */
    _write(port: number, register: number, value: number): void;
}
/** Browser-hosted YM2203 FM synth with shared Tetorica audio services. */
export declare class YM2203RuntimeSynth extends OPNRuntimeSynth {
    constructor(options?: {});
}

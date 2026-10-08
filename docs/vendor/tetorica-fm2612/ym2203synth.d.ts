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
export declare class YM2203DirectTransport extends OPNDirectTransport {
    constructor(chip: any);
}
/** YM2203 FM (including CH3 special) and its three-channel SSG. */
export declare class YM2203Synth extends OPNFMSynth {
    ssg: SSGSynth;
    /** @param {{transport: OPNDirectTransport, clock?: number}} options
     * clock is the master clock in Hz; frequency helpers assume the standard prescaler.
     */
    constructor({ transport, clock }?: {
        transport: OPNDirectTransport;
        clock?: number;
    });
    reset(): void;
    _write(port: any, register: any, value: any): void;
}
/** Browser-hosted YM2203 FM synth with shared Tetorica audio services. */
export declare class YM2203RuntimeSynth extends OPNRuntimeSynth {
    constructor(options?: {});
}

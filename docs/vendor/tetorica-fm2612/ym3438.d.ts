/**
 * @file ym3438.js
 * 実行環境: Browser / Node.js。依存: WASM（moduleFactory で注入）。DOM・Web Audio は不要。
 */
import { OpnVariant } from './opn_variant.js';
/** Example input clock in Hz; set the clock appropriate to the target machine. */
export declare const YM3438_CLOCK = 7670454;
/** YM3438 native core. Uses the variant-specific DAC/output implementation. */
export declare class Ym3438 extends OpnVariant {
    /**
     * @param {{moduleFactory: Function, moduleOptions?: Object}} options WASM loader settings.
     * @returns {Promise<Ym3438>} Caller-owned chip; dispose when finished.
     */
    static create({ moduleFactory, moduleOptions }?: {
        moduleFactory: Function;
        moduleOptions?: Object;
    }): Promise<Ym3438>;
}
/**
 * @param {Function} moduleFactory Generated ym3438_wasm.js factory.
 * @param {Object} [moduleOptions] Emscripten loader options.
 * @returns {Promise<Ym3438>}
 */
export declare function createYm3438(moduleFactory: Function, moduleOptions?: Object): Promise<Ym3438>;

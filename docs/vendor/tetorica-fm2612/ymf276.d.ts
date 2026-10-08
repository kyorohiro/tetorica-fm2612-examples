/**
 * @file ymf276.js
 * 実行環境: Browser / Node.js。依存: WASM（moduleFactory で注入）。DOM・Web Audio は不要。
 */
import { OpnVariant } from './opn_variant.js';
/** Example input clock in Hz; set the clock appropriate to the target machine. */
export declare const YMF276_CLOCK = 7670454;
/** YMF276 native core. Uses the variant-specific DAC/output implementation. */
export declare class Ymf276 extends OpnVariant {
    /**
     * @param {{moduleFactory: Function, moduleOptions?: Object}} options WASM loader settings.
     * @returns {Promise<Ymf276>} Caller-owned chip; dispose when finished.
     */
    static create({ moduleFactory, moduleOptions }?: {
        moduleFactory: Function;
        moduleOptions?: Object;
    }): Promise<Ymf276>;
}
/**
 * @param {Function} moduleFactory Generated ymf276_wasm.js factory.
 * @param {Object} [moduleOptions] Emscripten loader options.
 * @returns {Promise<Ymf276>}
 */
export declare function createYmf276(moduleFactory: Function, moduleOptions?: Object): Promise<Ymf276>;

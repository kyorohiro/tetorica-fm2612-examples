/**
 * @file ymf288.js
 * 実行環境: Browser / Node.js。依存: WASM（moduleFactory で注入）。DOM・Web Audio は不要。
 */
import { OpnVariant } from './opn_variant.js';
/** Example input clock in Hz; set the clock appropriate to the target machine. */
export declare const YMF288_CLOCK = 8000000;
/** YMF288 native core. FM/SSG core. Rhythm ROM loading is not exposed by this binding. */
export declare class Ymf288 extends OpnVariant {
    /**
     * @param {{moduleFactory: Function, moduleOptions?: Object}} options WASM loader settings.
     * @returns {Promise<Ymf288>} Caller-owned chip; dispose when finished.
     */
    static create({ moduleFactory, moduleOptions }?: {
        moduleFactory: Function;
        moduleOptions?: Object;
    }): Promise<Ymf288>;
}
/**
 * @param {Function} moduleFactory Generated ymf288_wasm.js factory.
 * @param {Object} [moduleOptions] Emscripten loader options.
 * @returns {Promise<Ymf288>}
 */
export declare function createYmf288(moduleFactory: Function, moduleOptions?: Object): Promise<Ymf288>;

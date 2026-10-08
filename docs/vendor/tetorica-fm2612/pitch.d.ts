/**
 * @file pitch.js
 * 実行環境: Browser / Node.js
 * 依存: JavaScript のデータ処理。DOM・Web Audio への依存なし。
 */
/**
 * Convert a MIDI note number into a YM2612-style BLOCK/FNUM pair.
 *
 * This helper is intentionally tiny and runtime-agnostic so browser demos,
 * game-side code, and shared playground utilities can all use the same pitch
 * conversion logic.
 *
 * @param {number} midi
 * @param {{
 *   referenceMidi: number,
 *   referenceBlock: number,
 *   referenceFnum: number,
 * }} reference
 * @returns {{ block: number, fnum: number }}
 */
export declare function createPitchFromMidi(midi: number, { referenceMidi, referenceBlock, referenceFnum, }: {
    referenceMidi: number;
    referenceBlock: number;
    referenceFnum: number;
}): {
    block: number;
    fnum: number;
};
/** Convert Hz to the closest YM2612 BLOCK/FNUM pair at the given chip clock.
 * @param {number} hz
 * @param {number} [clock]
 * @returns {{block: number, fnum: number}}
 */
export declare function hzToBlockFnum(hz: number, clock?: number): {
    block: number;
    fnum: number;
};

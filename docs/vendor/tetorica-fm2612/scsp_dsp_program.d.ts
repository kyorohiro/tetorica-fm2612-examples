/** Validate an MPRO image for the Synth's existing packed Delay ring/tables.
 * The lossless assembler intentionally accepts a wider inspection format.
 * @param {Uint16Array | readonly number[]} words
 * @returns {Uint16Array} An owned, validated 512-word image.
 */
export declare function validateScspDspDelayProgram(words: Uint16Array | readonly number[]): Uint16Array;
/** Assemble first, then check the narrower executable Synth profile.
 * @param {string} source
 * @returns {{words: Uint16Array, listing: string, stepCount: number, wordCount: number}}
 */
export declare function checkScspDspDelaySource(source: string): {
    words: Uint16Array;
    listing: string;
    stepCount: number;
    wordCount: number;
};
/** Validate the register-only execution profile used by Playground.
 * TEMP, MEMS, MIXS and EFREG0 remain available to Gain / FIR / IIR programs.
 * Sample RAM and its address controls require a separately reserved memory bank.
 * @param {Uint16Array | readonly number[]} words
 * @returns {Uint16Array}
 */
export declare function validateScspDspRegisterProgram(words: Uint16Array | readonly number[]): Uint16Array;

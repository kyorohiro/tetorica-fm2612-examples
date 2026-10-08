/**
 * @file tfi.js
 * 実行環境: Browser / Node.js
 * 依存: JavaScript のデータ処理。DOM・Web Audio への依存なし。
 */
/**
 * One logical YM2612 operator as used by `YM2612Synth`.
 *
 * `sr` is accepted as an alias when exporting because TFI usually calls
 * register `0x70` "sustain rate", while some existing demos in this repository
 * still expose the same register as `d2r`.
 *
 * @typedef {object} TfiOperatorPreset
 * @property {number} [multi]
 * @property {number} [dt]
 * @property {number} [tl]
 * @property {number} [rs]
 * @property {number} [ar]
 * @property {number} [d1r]
 * @property {number} [d2r]
 * @property {number} [sr]
 * @property {number} [rr]
 * @property {number} [sl]
 * @property {number} [ssg]
 */
export type TfiOperatorPreset = {
    multi?: number;
    dt?: number;
    tl?: number;
    rs?: number;
    ar?: number;
    d1r?: number;
    d2r?: number;
    sr?: number;
    rr?: number;
    sl?: number;
    ssg?: number;
};
export type TfiPreset = {
    algorithm: number;
    feedback: number;
    operators: [TfiOperatorPreset?, TfiOperatorPreset?, TfiOperatorPreset?, TfiOperatorPreset?];
};
export type TfiTargetSynth = {
    setPreset: (channel: number, preset: TfiPreset) => void;
};
/**
 * Preset shape shared between `web/tfi.js` and `YM2612Synth.setPreset()`.
 *
 * Operators are exposed in logical order:
 * `1, 2, 3, 4`.
 *
 * @typedef {object} TfiPreset
 * @property {number} algorithm
 * @property {number} feedback
 * @property {[
 *   TfiOperatorPreset?,
 *   TfiOperatorPreset?,
 *   TfiOperatorPreset?,
 *   TfiOperatorPreset?
 * ]} operators
 */
/**
 * Minimal synth-like shape used by `applyTfiToSynth()`.
 *
 * @typedef {object} TfiTargetSynth
 * @property {(channel: number, preset: TfiPreset) => void} setPreset
 */
export declare const TFI_FILE_SIZE = 42;
export declare const TFI_OPERATOR_FILE_ORDER: number[];
/**
 * Parse a 42-byte TFI file into a logical YM2612 preset.
 *
 * TFI stores operators in physical slot order `S1, S3, S2, S4`.
 * The returned preset converts that into logical operator order `0, 1, 2, 3`.
 *
 * @param {Uint8Array | ArrayBuffer | ArrayLike<number>} data
 * @returns {TfiPreset}
 */
export declare function parseTfi(data: Uint8Array | ArrayBuffer | ArrayLike<number>): TfiPreset;
/**
 * Parse TFI data and immediately apply it to one synth channel.
 *
 * @param {TfiTargetSynth} synth
 * @param {number} channel
 * @param {Uint8Array | ArrayBuffer | ArrayLike<number>} data
 * @returns {TfiPreset}
 */
export declare function applyTfiToSynth(synth: TfiTargetSynth, channel: number, data: Uint8Array | ArrayBuffer | ArrayLike<number>): TfiPreset;
/**
 * Convert one logical TFI operator block into readable JavaScript object text.
 *
 * The returned text is meant to fit directly into:
 * `fm.setOperator(CH1, OP1, |here|)`
 *
 * @param {TfiOperatorPreset} operator
 * @returns {string}
 */
export declare function createTfiOperatorObjectText(operator: TfiOperatorPreset): string;
/**
 * Convert a parsed TFI preset into readable JavaScript object text.
 *
 * The returned text is meant to fit directly into:
 * `fm.setPreset(CH1, |here|)`
 *
 * @param {TfiPreset} preset
 * @returns {string}
 */
export declare function createTfiPresetObjectText(preset: TfiPreset): string;
/**
 * Build a 42-byte TFI file from a logical YM2612 preset.
 *
 * The input preset uses logical operator numbers `1, 2, 3, 4`.
 * The produced TFI bytes are written in physical file order `S1, S3, S2, S4`.
 *
 * @param {TfiPreset} preset
 * @returns {Uint8Array}
 */
export declare function createTfiFromPreset(preset: TfiPreset): Uint8Array;
/**
 * Convert a TFI detune value into the YM2612 register encoding.
 *
 * TFI detune values are stored as:
 * `0=-3, 1=-2, 2=-1, 3=0, 4=+1, 5=+2, 6=+3`.
 *
 * @param {number} tfiDetune
 * @returns {number}
 */
export declare function tfiDetuneToYm2612Detune(tfiDetune: number): number;
/**
 * Convert a YM2612 register detune value into the TFI detune encoding.
 *
 * @param {number} ym2612Detune
 * @returns {number}
 */
export declare function ym2612DetuneToTfiDetune(ym2612Detune: number): number;

/** VGM Maker's 43-byte YM2612 instrument format. */
export declare const VGI_FILE_SIZE = 43;
/** Parse a 43-byte VGI file into a logical YM2612 preset. */
/** @param {Uint8Array | ArrayBuffer} data Exact-size VGI binary data.
 * @returns {import('./ym2612synth.js').YM2612Preset} Logical operators, algorithm, feedback and pan/modulation.
 * @throws {Error} For invalid size or out-of-range register values. */
export declare function parseVgi(data: Uint8Array | ArrayBuffer): import('./ym2612synth.js').YM2612Preset;
/** Create a 43-byte VGI file from a logical YM2612 preset. */
/** @param {import('./ym2612synth.js').YM2612Preset} preset Logical YM2612 patch.
 * @returns {Uint8Array} VGI file bytes in the format's operator order. */
export declare function createVgiFromPreset(preset: import('./ym2612synth.js').YM2612Preset): Uint8Array;

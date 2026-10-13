/**
 * Test whether a write belongs to the supported YM2608 FM register subset.
 * @param {number} port Register port (0 or 1).
 * @param {number} register Register address.
 * @returns {boolean} Whether the FM translator should forward this write.
 */
export declare function isYm2608FmRegister(port: number, register: number): boolean;
/**
 * Test whether a write belongs to the supported YM2610 FM register subset.
 * @param {number} port Register port (0 or 1).
 * @param {number} register Register address.
 * @returns {boolean} Whether the FM translator should forward this write.
 */
export declare function isYm2610FmRegister(port: number, register: number): boolean;
/**
 * Test whether a write belongs to the supported YM2203 FM register subset.
 * @param {number} port Register port (0 or 1).
 * @param {number} register Register address.
 * @returns {boolean} Whether the FM translator should forward this write.
 */
export declare function isYm2203FmRegister(port: number, register: number): boolean;
/**
 * Translate OPN FM frequency writes to the YM2612 VGM reference clock.
 * High-byte writes update shared latches; low-byte writes commit the converted pair.
 * @param {number} sourceClock VGM source clock in Hz, including optional variant bits.
 * @param {(register: number, value: number, port: number) => void} writeRegister Target register writer.
 * @param {(port: number, register: number) => boolean} isFmRegister Supported-register predicate.
 * @returns {(register: number, value: number, port?: number) => void} Ordered, stateful write translator.
 */
export declare function createOpnFmWriteTranslator(sourceClock: number, writeRegister: (register: number, value: number, port: number) => void, isFmRegister: (port: number, register: number) => boolean): (register: number, value: number, port?: number) => void;

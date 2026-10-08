export declare const VGM_METADATA_FIELDS: string[][];
/**
 * Read optional GD3 v1.00 metadata from decompressed VGM bytes.
 * @param {ArrayBuffer|Uint8Array} source Uncompressed VGM file.
 * @returns {Object<string, string>|null} Named metadata fields, or null for absent/invalid tags.
 */
export declare function parseVgmMetadata(source: ArrayBuffer | Uint8Array): Record<string, string> | null;
/**
 * @param {ArrayBuffer | Uint8Array} source
 * @returns {boolean}
 */
export declare function looksLikeGzip(source: ArrayBuffer | Uint8Array): boolean;
/**
 * @param {ArrayBuffer | Uint8Array} source
 * Detect gzip by its header and decompress VGZ using DecompressionStream.
 * Uncompressed input is copied; this does not validate the VGM command stream.
 * @throws {Error} If gzip decoding is unavailable or fails.
 * @returns {Promise<ArrayBuffer>} Uncompressed bytes owned by the caller.
 */
export declare function maybeDecodeVgmFile(source: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;

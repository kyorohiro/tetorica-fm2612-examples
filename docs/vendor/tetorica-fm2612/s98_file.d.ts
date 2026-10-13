/**
 * @file s98_file.js
 * 実行環境: Browser / Node.js
 * 依存: TextDecoder / TextEncoder とバイナリー配列。DOM・Web Audio は不要。
 */
/**
 * Check the three-byte S98 signature without validating the whole file.
 * @param {Uint8Array | ArrayBuffer} source Binary file contents.
 * @returns {boolean} Whether the file starts with S98.
 */
export declare function looksLikeS98(source: Uint8Array | ArrayBuffer): boolean;
/**
 * Convert an uncompressed, supported single-device S98 log into VGM.
 * @param {Uint8Array | ArrayBuffer} source S98 file contents.
 * @returns {{buffer: ArrayBuffer, sourceHeader: {format: string, numerator: number, denominator: number, dataOffset: number, loopOffset: number, tagOffset: number, devices: Array<{type: number, clock: number, pan: number}>, tag: string}}} VGM bytes and source metadata.
 * @throws {Error} For invalid/truncated data, compression or unsupported devices.
 */
export declare function convertS98ToVgm(source: Uint8Array | ArrayBuffer): {
    buffer: ArrayBuffer;
    sourceHeader: {
        format: string;
        numerator: number;
        denominator: number;
        dataOffset: number;
        loopOffset: number;
        tagOffset: number;
        devices: Array<{
            type: number;
            clock: number;
            pan: number;
        }>;
        tag: string;
    };
};

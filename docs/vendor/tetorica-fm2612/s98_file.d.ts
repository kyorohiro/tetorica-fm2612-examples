/**
 * @file s98_file.js
 * 実行環境: Browser / Node.js
 * 依存: TextDecoder / TextEncoder とバイナリー配列。DOM・Web Audio は不要。
 */
export declare function looksLikeS98(source: any): boolean;
export declare function convertS98ToVgm(source: any): {
    buffer: ArrayBuffer;
    sourceHeader: {
        format: string;
        numerator: number;
        denominator: number;
        dataOffset: number;
        loopOffset: number;
        tagOffset: number;
        devices: {
            type: number;
            clock: number;
            pan: number;
        }[];
        tag: string;
    };
};

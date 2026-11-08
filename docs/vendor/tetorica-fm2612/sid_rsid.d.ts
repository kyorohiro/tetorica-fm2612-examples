export declare const RSID_SPECIFICATION_URL = "https://hvsc.c64.org/download/C64Music/DOCUMENTS/SID_file_format.txt";
export declare const RSID_HEADER_BYTES = 124;
export declare const RSID_MAX_FILE_BYTES: number;
export declare class SidRsidError extends Error {
    code: string;
    constructor(message: any, code?: string);
}
/** Parse the single-SID RSID v2 layout, retaining declared clock/model hints.
 * Unknown/either hints remain unknown/either; no target is silently assumed.
 * The payload may occupy RAM under ROM/I/O up to the exclusive end $10000.
 * A BASIC init value of zero means BASIC startup, not a machine-code call.
 * File validation cannot establish ROM independence or whole-tune compatibility.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{maxBytes?:number}} [options]
 */
export declare function parseRsid(input: ArrayBuffer | ArrayBufferView, { maxBytes }?: {
    maxBytes?: number;
}): {
    format: string;
    version: number;
    dataOffset: number;
    programOffset: number;
    fileSize: number;
    headerLoadAddress: number;
    headerInitAddress: number;
    loadAddressEmbedded: boolean;
    loadAddress: number;
    initAddress: number;
    playAddress: number;
    endAddress: number;
    programLength: number;
    songs: number;
    startSong: number;
    speed: number;
    flags: number;
    basic: boolean;
    clockBits: number;
    modelBits: number;
    clock: string;
    model: string;
    clockHz: number | null;
    sidAddress: number;
    sidCount: number;
    timing: string;
    relocation: {
        startPage: number;
        pageLength: number;
    };
    metadata: {
        name: string;
        author: string;
        released: string;
    };
    program: Uint8Array<ArrayBuffer>;
    originalBytes: Uint8Array<ArrayBuffer>;
};
/** Select this first browser engine's PAL/6581 target without falsifying hints.
 * Unknown/either clock or model requires its corresponding explicit option.
 * Known NTSC/8580 is rejected even when an override was supplied. `rom` names
 * an execution mode only: the machine loader must separately validate all ROM
 * bytes and actually boot that environment before accepting a BASIC program.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{subtune?:number,clock?:'pal',model?:'6581',environment?:'minimal'|'rom',maxBytes?:number}} [options]
 * @returns {ReturnType<typeof parseRsid> & {subtune:number,selectedClock:'pal',selectedModel:'6581',clockHz:number,environment:'minimal'|'rom',selection:{clock:string,model:string}}}
 */
export declare function validateBrowserRsid(input: ArrayBuffer | ArrayBufferView, { subtune, clock, model, environment, maxBytes }?: {
    subtune?: number;
    clock?: 'pal';
    model?: '6581';
    environment?: 'minimal' | 'rom';
    maxBytes?: number;
}): ReturnType<typeof parseRsid> & {
    subtune: number;
    selectedClock: 'pal';
    selectedModel: '6581';
    clockHz: number;
    environment: 'minimal' | 'rom';
    selection: {
        clock: string;
        model: string;
    };
};

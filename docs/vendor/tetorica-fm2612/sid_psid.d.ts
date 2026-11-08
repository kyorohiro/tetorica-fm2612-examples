export declare const PSID_SPECIFICATION_URL = "https://hvsc.c64.org/download/C64Music/DOCUMENTS/SID_file_format.txt";
export declare const PSID_HEADER_BYTES = 124;
export declare const PSID_MAX_FILE_BYTES: number;
export declare class SidPsidError extends Error {
    code: string;
    constructor(message: any, code?: string);
}
/** Private common layout parser. Strict target guards retain the CLI's original
 * validation order; the browser reads raw hints before its explicit selection.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{maxBytes?:number}} [options]
 * @param {boolean} [strictTarget]
 */
declare function parsePsidStructure(input: ArrayBuffer | ArrayBufferView, { maxBytes }?: {
    maxBytes?: number;
}, strictTarget?: boolean): {
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
    clock: string;
    clockHz: number | null;
    model: string;
    sidAddress: number;
    sidCount: number;
    songSpeeds: ("cia" | "vbi")[];
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
/** Parse an explicitly PAL/6581, single-SID PSID v2/v3/v4 for reference tooling.
 * This entry remains strict: browser target choices cannot loosen the CLI.
 * An explicit play subroutine inside the payload is required; IRQ-installed
 * and init-generated playback entry points are not implemented. Speed flags
 * are retained, so callers enforce their supported VBI/CIA mode separately.
 * Does not execute or prove the safety/ROM independence of the C64 program.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{maxBytes?:number}} [options]
 */
export declare function parsePsid(input: ArrayBuffer | ArrayBufferView, { maxBytes }?: {
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
    sidAddress: number;
    sidCount: number;
    songSpeeds: ("cia" | "vbi")[];
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
    clock: string;
    clockHz: number;
    model: string;
};
/** Validate the smaller standalone browser-player subset and select a song.
 * This checks the file layout, not the program's instructions or behavior.
 * The selected song chooses its VBI or CIA runner. Each bounded CPU runner
 * must independently enforce its supported instructions and ROM dependencies.
 * Header initAddress 0 follows PSID's effective-load-address fallback.
 * Unknown/either clock and model hints need corresponding explicit options.
 * Known NTSC/8580 is rejected even if a PAL/6581 override was supplied. The
 * returned declaration fields and original header bytes are never rewritten.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{subtune?:number,clock?:'pal',model?:'6581',vbiBackend?:'direct'|'c64',maxBytes?:number}} [options]
 * @returns {ReturnType<typeof parsePsidStructure> & {subtune:number,timing:'vbi'|'cia',playbackBackend:'direct'|'c64',driverPage:number|null,selectedClock:'pal',selectedModel:'6581',clockHz:number,selection:{clock:string,model:string}}}
 */
export declare function validateBrowserPsid(input: ArrayBuffer | ArrayBufferView, { subtune, clock, model, vbiBackend, maxBytes }?: {
    subtune?: number;
    clock?: 'pal';
    model?: '6581';
    vbiBackend?: 'direct' | 'c64';
    maxBytes?: number;
}): ReturnType<typeof parsePsidStructure> & {
    subtune: number;
    timing: 'vbi' | 'cia';
    playbackBackend: 'direct' | 'c64';
    driverPage: number | null;
    selectedClock: 'pal';
    selectedModel: '6581';
    clockHz: number;
    selection: {
        clock: string;
        model: string;
    };
};
export {};

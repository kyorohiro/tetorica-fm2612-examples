/** Browser / Worker / Node: SPC state and ID666/xid6 metadata, without emulation.
 * Format reference: https://snesmusic.org/files/spc_file_format.txt
 * Tag bytes are retained because legacy text encoding and the unmarked
 * text/binary ID666 layouts cannot always be determined automatically.
 */
export declare const SPC_SAMPLE_RATE = 32000;
export declare const SPC_MIN_FILE_SIZE = 65920;
export declare const SPC_FILE_SIZE = 66048;
/** Parse a copied, immutable-by-convention SPC image. CPU/RAM/DSP arrays are
 * independent of the input and originalBytes. No source is fetched or executed.
 * ID666 has no layout/encoding flag: use id666Format/textEncoding if automatic
 * text/binary or UTF-8/Windows-1252 detection is unsuitable. xid6 overrides
 * corresponding ID666 display fields; both raw tags and unknown tails remain.
 * Durations are seconds; xid6 integer times use 64,000 ticks per second.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{textEncoding?:string,id666Format?:'auto'|'text'|'binary'}} [options]
 */
export declare function parseSpcFile(input: ArrayBuffer | ArrayBufferView, { textEncoding, id666Format }?: {
    textEncoding?: string;
    id666Format?: 'auto' | 'text' | 'binary';
}): {
    format: string;
    originalBytes: Uint8Array<ArrayBuffer>;
    version: number;
    cpu: {
        pc: number;
        a: number;
        x: number;
        y: number;
        psw: number;
        sp: number;
    };
    ram: Uint8Array<ArrayBuffer>;
    dsp: Uint8Array<ArrayBuffer>;
    extraRam: Uint8Array<ArrayBuffer> | null;
    metadata: {
        artist: string;
        playSeconds: number;
        fadeSeconds: number;
        mutedChannels: any;
        emulator: any;
        dumpDate: string | number | undefined;
        amplification: number;
    };
    id666: {
        present: boolean;
        raw: any;
        metadata: {
            artist: string;
            dumpDate: string | number | undefined;
            playSeconds: number;
            fadeSeconds: number;
            mutedChannels: any;
            emulator: any;
        };
        layout?: undefined;
        ambiguous?: undefined;
    } | {
        present: boolean;
        layout: any;
        ambiguous: boolean;
        raw: any;
        metadata: {
            artist: string;
            dumpDate: string | number | undefined;
            playSeconds: number;
            fadeSeconds: number;
            mutedChannels: any;
            emulator: any;
        };
    };
    xid6: {
        present: boolean;
        tags: any[];
        metadata: {
            dumpDate: string | number | undefined;
            amplification: number;
        };
        declaredSize?: undefined;
        raw?: undefined;
    } | {
        present: boolean;
        declaredSize: number;
        tags: {
            id: any;
            type: any;
            length: number;
            value: string | number | undefined;
            bytes: any;
        }[];
        metadata: {
            dumpDate: string | number | undefined;
            amplification: number;
        };
        raw: any;
    };
    warnings: string[];
};

/**
 * CD-DA input preparation for Browser and Node.js.
 * Files stay as interleaved little-endian PCM16 bytes. No full-file Float32
 * decoding, fetching, playback clock or output device is created here.
 */
export declare const CDDA_SAMPLE_RATE = 44100;
export declare const CDDA_CHANNELS = 2;
export declare const CDDA_BYTES_PER_FRAME = 4;
export declare const CDDA_MAX_TRACK_BYTES: number;
/**
 * Validate one complete RIFF/WAVE file containing 44.1 kHz stereo PCM16.
 * The returned PCM is a view into the supplied bytes, without a copy. Keep
 * those bytes unchanged until playback is finished. Non-audio RIFF chunks
 * are skipped, including their required odd-length padding byte.
 */
export declare function parseCddaWav(source: any): Readonly<{
    sampleRate: 44100;
    channels: 2;
    frames: number;
    pcm: Uint8Array<ArrayBufferLike>;
}>;
/**
 * Normalize {tracks:[{number,file,startFrame?,endFrame?,title?,type?:'audio'}]}.
 * Frame ranges are half-open [startFrame,endFrame) in the referenced WAV.
 * Omitted startFrame is zero; omitted endFrame is the end of that file.
 * Track numbers are explicit, unique and preserved. No pregap is inserted.
 */
export declare function parseCddaTrackManifest(input: any): readonly Readonly<{
    number: any;
    file: any;
    title: any;
    startFrame: any;
}>[];
/**
 * Create a lazy source. Only getTrack(number) reads PCM; this object does not
 * retain a cache of all referenced WAV files. readFile(path,{signal}) must
 * return an ArrayBuffer or Uint8Array from the caller's Virtual Files layer.
 * The optional signal applies to the whole source; getTrack can additionally
 * take {signal} for a single pending load. Cancellation is checked after the
 * file await even if readFile itself cannot cancel its work.
 * @param {unknown} manifest
 * @param {{readFile?:(path:string,options?:{signal?:AbortSignal})=>Promise<ArrayBuffer|Uint8Array>,signal?:AbortSignal}} [options]
 */
export declare function createCddaTrackSource(manifest: unknown, { readFile, signal }?: {
    readFile?: (path: string, options?: {
        signal?: AbortSignal;
    }) => Promise<ArrayBuffer | Uint8Array>;
    signal?: AbortSignal;
}): Readonly<{
    tracks: readonly Readonly<{
        number: any;
        file: any;
        title: any;
        startFrame: any;
    }>[];
    getTrack(number: any, { signal: loadSignal }?: {}): Promise<any>;
}>;
/** One-track convenience for WAV bytes already held by the caller.
 * @param {Uint8Array|ArrayBuffer} bytes
 * @param {{number?:number,title?:string,signal?:AbortSignal}} [options]
 */
export declare function createCddaWavTrackSource(bytes: Uint8Array | ArrayBuffer, { number, title, signal }?: {
    number?: number;
    title?: string;
    signal?: AbortSignal;
}): Readonly<{
    tracks: readonly Readonly<{
        number: number;
        title: string;
        startFrame: 0;
    }>[];
    getTrack(selectedNumber: any, { signal: loadSignal }?: {}): Promise<any>;
}>;
/** Load one selected manifest track without retaining any other source. */
export declare function loadCddaTrack(manifest: any, number: any, options: any): Promise<any>;
/** Explicit eager convenience. Prefer createCddaTrackSource for long albums. */
export declare function loadCddaTracks(manifest: any, options: any): Promise<readonly any[]>;

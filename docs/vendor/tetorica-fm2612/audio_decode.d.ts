/** Media preparation shared by browser and native playback. Importing this
 * module creates no audio context and opens no output device. */
export declare function decodeAudioBuffer(context: any, bytes: any): Promise<any>;
/** Lazy preparation-only decoder. Never render, connect nodes, or open a live
 * AudioContext just to decode a compressed sample for native playback. */
export declare function createOfflineAudioDecoder({ getSampleRate }?: {
    getSampleRate?: (() => 48000) | undefined;
}): (bytes: any) => Promise<any>;
export declare function normalizeLocalMediaUrl(url: any): string;

export declare function snapshotY8950AdpcmSource(source: any): any;
/** Prepare an admin upload on the control thread, without touching audio state. */
export declare function prepareY8950AdpcmSample(source: any, options: {} | undefined, clock: any, decode: any): Promise<{
    bytes: Uint8Array<ArrayBuffer>;
    metadata: {
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        deltaN: number;
        sampleRate: number;
        duration: number;
        name: string;
        source: string;
        preview: {
            start: number;
            end: number;
            frames: number;
            name: string;
            source: string;
            waveform: number[];
        } | null;
        clock: any;
    };
}>;
export declare function createY8950AdpcmPreview(bytes: any, { start, name, source }?: {
    name?: string | undefined;
    source?: string | undefined;
    start?: number | undefined;
}): {
    start: number;
    end: number;
    frames: number;
    name: string;
    source: string;
    waveform: number[];
} | null;
export declare function validateY8950AdpcmPreview(preview: any, start: any, length: any): {
    start: any;
    end: any;
    frames: number;
    name: any;
    source: any;
    waveform: any;
} | null;
/** Derive controls from applied registers; active is the authored hardware gate,
 * not a claim that EOS has not occurred. Waveforms are pre-volume decoded data.
 */
export declare function readY8950Adpcm(registers: any, clock: any, { memoryBytes, revision, preview }?: {
    memoryBytes?: number | undefined;
    preview?: null | undefined;
    revision?: number | undefined;
}): {
    start: number;
    end: number;
    deltaN: number;
    playbackRate: number;
    volume: any;
    repeat: boolean;
    playing: boolean;
    activeSource: string;
    addressUnit: number;
    memorySize: number;
    memoryRevision: number;
    validRange: boolean;
    waveformKnown: boolean;
    waveform: any;
    sampleName: any;
};

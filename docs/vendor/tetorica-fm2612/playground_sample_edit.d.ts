/** Frame ends are exclusive. All edit/loop/draw positions refer to the original source. */
export declare function normalizeSampleEdit(audio: any, settings?: {}): {
    startFrame: number;
    endFrame: number;
    gainDb: number;
    fadeInSeconds: number;
    fadeOutSeconds: number;
    rootMidi: number;
    tuneCents: number;
    loopEnabled: any;
    loopStartFrame: number;
    loopEndFrame: number;
    drawPoints: [any, any][];
    drawStrokes: any;
};
export declare function createSampleEdit(audio: any, { settings }?: {
    settings?: {} | undefined;
}): {
    startFrame: number;
    endFrame: number;
    gainDb: number;
    fadeInSeconds: number;
    fadeOutSeconds: number;
    rootMidi: number;
    tuneCents: number;
    loopEnabled: any;
    loopStartFrame: number;
    loopEndFrame: number;
    drawPoints: [any, any][];
    drawStrokes: any;
};
/**
 * Render an owned PCM copy. rootMidi/tuneCents are instrument metadata, not destructive resampling.
 * @param {any} audio
 * @param {any} settings
 * @param {{sampleRate?: number, mono?: boolean, maxFrames?: number}} [options]
 */
export declare function renderSampleEdit(audio: any, settings: any, { sampleRate, mono, maxFrames }?: {
    sampleRate?: number;
    mono?: boolean;
    maxFrames?: number;
}): {
    channels: any[];
    sampleRate: number;
    loopEnabled: any;
    loopStartFrame: number;
    loopEndFrame: number;
    rootMidi: number;
    tuneCents: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    peakBeforeClip: number;
    clippedSamples: number;
};
/** Absolute gain for a chosen peak; ignores the previous gain and fade handles. */
export declare function sampleNormalizationGainDb(audio: any, settings: any, { peak, mono }?: {
    mono?: boolean | undefined;
    peak?: number | undefined;
}): number;
/** The selection is one user-chosen cycle, not an automatic extraction from a recording. */
export declare function renderGameboyWave(audio: any, settings: any): Uint8Array<ArrayBuffer>;
/** Project audio asset: IEEE float32 RIFF WAV preserves original Float32 PCM exactly. */
export declare function encodeSampleWav(audio: any): Uint8Array<ArrayBuffer>;
/** Binary-only wrapper: never loads paths, URLs or devices.
 * Returns decoded Float32 channels and the WAV sample rate; edit/instrument
 * metadata is stored separately and is not recovered from this audio container.
 * @param {Uint8Array|ArrayBuffer} bytes
 * @returns {Promise<import('./wav.js').ChannelPCM>}
 */
export declare function decodeSampleWav(bytes: Uint8Array | ArrayBuffer): Promise<import('./wav.js').ChannelPCM>;
/** Pitch is a heuristic hint, not pitch detection for arbitrary speech/chords/percussion. */
export declare function estimateSamplePitch(audio: any, settings: any): {
    hz: null;
    midi: null;
    cents: null;
    confidence: string;
    reason: any;
} | {
    hz: number | undefined;
    midi: number;
    cents: number;
    confidence: string;
    reason: string;
};

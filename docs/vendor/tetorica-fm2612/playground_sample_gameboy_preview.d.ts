/**
 * The display is sampled from the same edited mono selection used by the converter.
 * Its source positions span both endpoints and are bounded independently of recording length.
 * Wave RAM always comes from renderGameboyWave, including its circular resampling.
 */
export declare function renderGameboySampleComparison(audio: any, settings: any): {
    source: Float32Array<ArrayBuffer>;
    waveform: Uint8Array<ArrayBuffer>;
    rootMidi: number;
    tuneCents: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    peakBeforeClip: number;
    clippedSamples: number;
};
/**
 * Render a short note through a private native Game Boy core, never a live chip or device.
 * Like createSampleInstrument's wave RAM target, rootMidi is an integer MIDI note and
 * tuneCents is sample metadata: it does not transpose an independently pitched wave channel.
 * PCM uses the shared Game Boy listening gain, followed by a 5ms endpoint fade.
 * The module factory/loader is injected by the Worker or Node caller.
 * @param {any} audio
 * @param {any} settings
 * @param {{moduleFactory: Function, moduleOptions?: any}} options
 * @returns {Promise<{channels: Float32Array[], sampleRate: number, waveform: Uint8Array,
 * rootMidi: number, tuneCents: number, durationSeconds: number, frequencyHz: number}>}
 */
export declare function renderGameboySamplePreview(audio: any, settings: any, { moduleFactory, moduleOptions }?: {
    moduleFactory: Function;
    moduleOptions?: any;
}): Promise<{
    channels: Float32Array[];
    sampleRate: number;
    waveform: Uint8Array;
    rootMidi: number;
    tuneCents: number;
    durationSeconds: number;
    frequencyHz: number;
}>;

export declare const BRR_BLOCK_BYTES = 9;
export declare const BRR_BLOCK_SAMPLES = 16;
/** Decode complete 9-byte blocks until the first END, with zero initial BRR
 * history unless supplied as [most recent, previous] signed16 samples.
 * PCM is before DSP interpolation/envelopes and uses a nominal 32,000-Hz
 * sample rate (PITCH=0x1000). A sample's musical root note is not in BRR.
 * Missing END is reported; extraction rejects such candidates by default.
 * @param {ArrayBuffer|ArrayBufferView} input
 * @param {{history?:number[],maxBlocks?:number}} [options]
 */
export declare function decodeBrr(input: ArrayBuffer | ArrayBufferView, { history, maxBlocks }?: {
    history?: number[];
    maxBlocks?: number;
}): {
    pcm: Float32Array<ArrayBuffer>;
    pcm16: Int16Array<ArrayBuffer>;
    sampleRate: number;
    blockCount: number;
    endReached: boolean;
    loop: boolean;
    finalHistory: any[];
};
/** Snapshot-only voice parameters. active is a display heuristic from ENVX or
 * OUTX, not a reconstruction of key-on history or internal envelope state.
 */
export declare function readSnesVoices(snapshot: any): {
    index: number;
    sourceNumber: number;
    active: boolean;
    pitch: number;
    volumeLeft: number;
    volumeRight: number;
    adsr1: number;
    adsr2: number;
    gain: number;
    envelopeMode: string;
    attack: number;
    decay: number;
    sustainLevel: number;
    sustainRate: number;
    gainMode: string;
    gainValue: number;
    envx: number;
    outx: number;
    noise: boolean;
    pitchModulation: boolean;
    echo: boolean;
    keyOnRegister: boolean;
    keyOffRegister: boolean;
    endx: boolean;
}[];
/** Extract only selected SRCNs, or currently audible voice SRCNs by default.
 * Directory is a DSP DIR byte (0..255), not a byte address. Reads wrap at the
 * hardware 16-bit RAM boundary, but each candidate is bounded to one RAM's
 * worth of complete blocks and must reach END. Invalid candidates are
 * reported in rejected; unused directory slots are never scanned implicitly.
 * Loops outside/aligned differently from the extracted segment retain their
 * raw addresses but have no invented PCM loop marker.
 * @param {{ram:Uint8Array,dsp:Uint8Array,nativeFrames?:number}} snapshot
 * Total decoding defaults to at most eight RAM images, even when callers
 * explicitly request all SRCNs. Increase maxTotalBlocks explicitly if needed.
 * @param {{directory?:number,sourceNumbers?:number[],maxBlocks?:number,maxTotalBlocks?:number}} [options]
 */
export declare function extractBrrSamples(snapshot: {
    ram: Uint8Array;
    dsp: Uint8Array;
    nativeFrames?: number;
}, { directory, sourceNumbers, maxBlocks, maxTotalBlocks }?: {
    directory?: number;
    sourceNumbers?: number[];
    maxBlocks?: number;
    maxTotalBlocks?: number;
}): {
    directory: any;
    directoryAddress: number;
    nativeFrames: number | null;
    samples: {
        pcm: Float32Array<ArrayBuffer>;
        pcm16: Int16Array<ArrayBuffer>;
        sampleRate: number;
        blockCount: number;
        endReached: boolean;
        loop: boolean;
        finalHistory: any[];
        sourceNumber: any;
        directory: any;
        directoryEntryAddress: number;
        startAddress: number;
        loopAddress: number;
        brr: Uint8Array<ArrayBuffer>;
        loopResolved: boolean;
        loopStartSamples: number | null;
        loopEndSamples: number | null;
        hash: string;
        hashAlgorithm: string;
        version: string;
        nativeFrames: number | null;
        voices: {
            index: number;
            sourceNumber: number;
            active: boolean;
            pitch: number;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            gain: number;
            envelopeMode: string;
            attack: number;
            decay: number;
            sustainLevel: number;
            sustainRate: number;
            gainMode: string;
            gainValue: number;
            envx: number;
            outx: number;
            noise: boolean;
            pitchModulation: boolean;
            echo: boolean;
            keyOnRegister: boolean;
            keyOffRegister: boolean;
            endx: boolean;
        }[];
        warnings: string[];
    }[];
    rejected: {
        sourceNumber: any;
        startAddress: number;
        loopAddress: number;
        reason: string;
    }[];
    warnings: string[];
};
/** WAV has raw mono sample PCM only. The JSON-compatible sidecar retains DSP
 * parameters and loop markers; it deliberately does not claim to be a full
 * instrument preset. rootNote is optional MIDI 0..127 supplied by the caller.
 * Exported loops describe source samples, not a reconstructed DSP voice.
 * @param {ReturnType<typeof extractBrrSamples>['samples'][number]} sample
 * @param {{rootNote?:number}} [options]
 */
export declare function exportBrrSample(sample: ReturnType<typeof extractBrrSamples>['samples'][number], { rootNote }?: {
    rootNote?: number;
}): {
    wav: Uint8Array<ArrayBuffer>;
    metadata: {
        format: string;
        schemaVersion: number;
        sampleRate: number;
        channels: number;
        pcmFrames: number;
        rootNote: number | null;
        sourceNumber: any;
        directory: any;
        startAddress: number;
        loopAddress: number;
        loop: boolean;
        loopResolved: boolean;
        loopStartSamples: number | null;
        loopEndSamples: number | null;
        hash: string;
        hashAlgorithm: string;
        version: string;
        nativeFrames: number | null;
        voices: {
            index: number;
            sourceNumber: number;
            active: boolean;
            pitch: number;
            volumeLeft: number;
            volumeRight: number;
            adsr1: number;
            adsr2: number;
            gain: number;
            envelopeMode: string;
            attack: number;
            decay: number;
            sustainLevel: number;
            sustainRate: number;
            gainMode: string;
            gainValue: number;
            envx: number;
            outx: number;
            noise: boolean;
            pitchModulation: boolean;
            echo: boolean;
            keyOnRegister: boolean;
            keyOffRegister: boolean;
            endx: boolean;
        }[];
        warnings: string[];
        rendering: string;
    };
};

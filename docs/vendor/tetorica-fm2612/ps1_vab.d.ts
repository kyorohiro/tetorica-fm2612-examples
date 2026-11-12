export declare const MAX_VAB_FILE_BYTES: number;
export type Ps1VabSample = {
    /**
     * Original one-based VAB sample number.
     */
    index: number;
    /**
     * Owned raw sample bytes; no decoding or encoding.
     */
    bytes: Uint8Array;
};
export type Ps1VabTone = {
    /**
     * Original Program number, 0..127.
     */
    program: number;
    /**
     * Tone index within that Program, 0..15.
     */
    index: number;
    /**
     * One-based sample number; 0 is unassigned and 255 is libsnd Noise.
     */
    sample: number;
    /**
     * Raw Tone mode flags, including bit 2 reverb send.
     */
    mode: number;
    /**
     * Tone volume code, 0..127.
     */
    volume: number;
    /**
     * Tone pan code, 0..127.
     */
    pan: number;
    /**
     * Center MIDI note, 0..127.
     */
    center: number;
    /**
     * Positive playback fine tuning in 1/128 semitone units.
     */
    shift: number;
    /**
     * Minimum key code, 0..127.
     */
    keyLow: number;
    /**
     * Maximum key code, 0..127.
     */
    keyHigh: number;
    /**
     * Raw ADSR1 register.
     */
    adsr1: number;
    /**
     * Raw ADSR2 register.
     */
    adsr2: number;
    /**
     * Recorded vibrato width code.
     */
    vibratoWidth: number;
    /**
     * Recorded vibrato time code.
     */
    vibratoTime: number;
    /**
     * Recorded portamento width code.
     */
    portamentoWidth: number;
    /**
     * Recorded portamento time code.
     */
    portamentoTime: number;
    /**
     * Recorded downward pitch bend range.
     */
    bendMin: number;
    /**
     * Recorded upward pitch bend range.
     */
    bendMax: number;
};
export type Ps1VabProgram = {
    /**
     * Original Program number, 0..127; sparse numbers are retained.
     */
    index: number;
    /**
     * Program volume code, 0..127.
     */
    volume: number;
    /**
     * Program pan code, 0..127.
     */
    pan: number;
    /**
     * Tones in their original Program order.
     */
    tones: Ps1VabTone[];
};
export type Ps1VabBank = {
    /**
     * Supported standard VAB version.
     */
    version: 6 | 7;
    /**
     * Original VAB identifier.
     */
    id: number;
    /**
     * Bank volume code, 0..127.
     */
    masterVolume: number;
    /**
     * Bank pan code, 0..127.
     */
    masterPan: number;
    /**
     * Nonempty Programs in table order.
     */
    programs: Ps1VabProgram[];
    /**
     * All Tones in packed Program/Tone order.
     */
    tones: Ps1VabTone[];
    /**
     * Samples in one-based VAB number order.
     */
    samples: Ps1VabSample[];
};
export type Ps1VabPreparedTone = {
    /**
     * Owned original bytes through the first END packet.
     */
    adpcm: Uint8Array;
    /**
     * Explicit sample tuning and optional packet-aligned loop start.
     */
    options: {
        baseFrequencyHz: number;
        loopStartSamples?: number;
    };
    /**
     * Voice settings, excluding the uploaded sample ID.
     */
    preset: {
        adsr1: number;
        adsr2: number;
        pitch: number;
        reverb: boolean;
        volumeLeft: number;
        volumeRight: number;
    };
    /**
     * The selected source Tone metadata.
     */
    tone: Ps1VabTone;
    /**
     * Original bounded bytes omitted after END.
     */
    trimmedBytes: number;
};
export type Ps1VabExportOptions = {
    /**
     * Index in bank.tones. Omit for a byte-exact full source bank.
     */
    toneNumber?: number;
};
/** Parse a complete VAB, or a VH header plus its explicitly supplied VB body.
 * Counts are actual counts (not count minus one). Tone tables are packed by
 * nonempty program, while the 128-entry program table may have holes.
 * No file names, code execution, AudioContext or live RAM are involved.
 * @param {ArrayBuffer|ArrayBufferView} headerInput Complete VAB or VH bytes.
 * @param {ArrayBuffer|ArrayBufferView} [bodyInput] Matching VB bytes for split input.
 * @returns {Ps1VabBank} */
export declare function readVab(headerInput: ArrayBuffer | ArrayBufferView, bodyInput?: ArrayBuffer | ArrayBufferView): Ps1VabBank;
/** Export an opened, unchanged standard VAB without an audio core or encoder.
 * Full-bank output preserves the original VH + VB bytes, including padding.
 * A selected Tone keeps its original Program number and raw attributes, but
 * becomes the only Tone (index 0) and references the only sample (number 1).
 * This exports source banks, not arbitrary edited Synth instruments.
 * @param {Ps1VabBank} bank
 * @param {Ps1VabExportOptions} [options]
 * @returns {Uint8Array} */
export declare function exportVab(bank: Ps1VabBank, options?: Ps1VabExportOptions): Uint8Array;
/** Prepare one Tone for the existing Synth/preset API. ADPCM payload is never
 * decoded or re-encoded. Trim only bytes after the first hardware END packet.
 * Unsupported flag patterns fail instead of silently rewriting game data.
 * @param {Ps1VabBank} bank
 * @param {number} toneNumber Index in bank.tones, not a Program number.
 * @returns {Ps1VabPreparedTone} */
export declare function prepareVabTone(bank: Ps1VabBank, toneNumber: number): Ps1VabPreparedTone;

export type SidWaveformName = 'triangle' | 'saw' | 'pulse' | 'noise';
export type SidWaveform = 'off' | 'triangle' | 'saw' | 'triangle+saw' | 'pulse' | 'triangle+pulse' | 'saw+pulse' | 'triangle+saw+pulse' | 'noise' | 'triangle+noise' | 'saw+noise' | 'triangle+saw+noise' | 'pulse+noise' | 'triangle+pulse+noise' | 'saw+pulse+noise' | 'triangle+saw+pulse+noise';
/** @typedef {'triangle'|'saw'|'pulse'|'noise'} SidWaveformName */
/** @typedef {'off'|'triangle'|'saw'|'triangle+saw'|'pulse'|'triangle+pulse'|'saw+pulse'|'triangle+saw+pulse'|'noise'|'triangle+noise'|'saw+noise'|'triangle+saw+noise'|'pulse+noise'|'triangle+pulse+noise'|'saw+pulse+noise'|'triangle+saw+pulse+noise'} SidWaveform */
/** Hardware waveform flags in canonical low-to-high bit order.
 * @type {readonly SidWaveformName[]} */
export declare const SID_WAVEFORMS: readonly SidWaveformName[];
/** Decode a waveform name or '+' combination into the four-bit hardware mask.
 * Order is accepted in either direction; unknown/empty/duplicate flags reject.
 * Use sidWaveformFromBits() to obtain the canonical spelling.
 * @param {string} value
 * @returns {number} Integer 0..15; off is zero. */
export declare function sidWaveformBits(value: string): number;
/** Canonical hardware waveform spelling, including off and all combinations.
 * @param {number} bits Integer 0..15.
 * @returns {SidWaveform} */
export declare function sidWaveformFromBits(bits: number): SidWaveform;

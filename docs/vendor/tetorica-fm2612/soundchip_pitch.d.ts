/** Shared musical pitch validation; numbers are integer MIDI notes, never Hz. */
/** @param {string|number} note @returns {number} Hz, with A4 = MIDI 69 = 440 Hz. */
export declare function noteToHz(note: string | number): number;
/** Hz at standard FM prescaling. Raw prescaler changes require explicit BLOCK/F-NUM.
 * @param {number} hz @param {number} clock @param {number} [divider=144] @param {{clamp?:boolean}} [options] */
export declare function opnPitchFromHz(hz: number, clock: number, divider?: number, { clamp }?: {
    clamp?: boolean;
}): {
    block: number;
    fnum: number;
};
/** OPM pitch at the supplied master Hz, quantized to 1/64 semitone.
 * @param {number} hz @param {number} [clock=3579545] */
export declare function opmPitchFromHz(hz: number, clock?: number): {
    keyCode: number;
    keyFraction: number;
};
/** Continuous MIDI pitch (including bends/interpolation), A4=69=440 Hz.
 * Clamp unrepresentable pitches like the MIDI Playground native renderer.
 * @param {number} midi @param {number} [clock=7670454] @param {number} [divider=144] */
export declare function midiToOpnPitch(midi: number, clock?: number, divider?: number): {
    block: number;
    fnum: number;
};

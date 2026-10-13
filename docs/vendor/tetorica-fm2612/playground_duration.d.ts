/** Resolve a note length once, before any sound is started. Legacy units differ by API. */
/**
 * @param {{beats?: number, seconds?: number, duration?: number}} options Specify at most one duration field.
 * @param {number} bpm Positive beats per minute when converting beats.
 * @param {'seconds' | 'beats'} [legacyUnit='seconds'] Unit of the legacy duration field and defaultDuration.
 * @param {number} [defaultDuration=0.2] Fallback in legacyUnit.
 * @returns {number} Finite nonnegative duration in seconds.
 * @throws {TypeError | RangeError} For conflicting fields or invalid duration/tempo.
 */
export declare function resolvePlaySeconds(options: {
    beats?: number;
    seconds?: number;
    duration?: number;
}, bpm: number, legacyUnit?: 'seconds' | 'beats', defaultDuration?: number): number;
/** Preserve beats until the shared clock waits for the note; never freeze tempo here.
 * @param {{beats?:number,seconds?:number,duration?:number}} options
 * @param {'seconds'|'beats'} [legacyUnit]
 * @param {number} [defaultDuration]
 * @returns {{seconds?:number,beats?:number}}
 */
export declare function resolvePlayDuration(options: {
    beats?: number;
    seconds?: number;
    duration?: number;
}, legacyUnit?: 'seconds' | 'beats', defaultDuration?: number): {
    seconds?: number;
    beats?: number;
};

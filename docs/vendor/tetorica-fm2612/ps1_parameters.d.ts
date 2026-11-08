export type Ps1Envelope = {
    attackRate: number;
    attackExponential: boolean;
    decayRate: number;
    sustainLevel: number;
    sustainRate: number;
    sustainDecrease: boolean;
    sustainExponential: boolean;
    releaseRate: number;
    releaseExponential: boolean;
};
export type Ps1ReverbPreset = 'off' | 'room' | 'studio-small' | 'studio-medium' | 'studio-large' | 'hall' | 'space-echo' | 'half-echo';
export type Ps1Reverb = {
    preset: Ps1ReverbPreset;
    volumeLeft: number;
    volumeRight: number;
};
/** Decode named ADSR fields without interpreting them as exact durations.
 * @param {number} adsr1 @param {number} adsr2 @returns {Ps1Envelope} */
export declare function decodePs1Envelope(adsr1: number, adsr2: number): Ps1Envelope;
/** Merge a partial named envelope while retaining unedited raw bits, including
 * ADSR2 bit 13, which the experimental core does not interpret.
 * @param {number} adsr1 @param {number} adsr2 @param {Partial<Ps1Envelope>} values
 * @returns {{adsr1:number,adsr2:number}} */
export declare function patchPs1Envelope(adsr1: number, adsr2: number, values: Partial<Ps1Envelope>): {
    adsr1: number;
    adsr2: number;
};
/** Encode a named envelope, using fast attack/full sustain/fast release for
 * omitted fields. Use patchPs1Envelope() to preserve existing raw register bits.
 * @param {Partial<Ps1Envelope>} values @returns {{adsr1:number,adsr2:number}} */
export declare function encodePs1Envelope(values: Partial<Ps1Envelope>): {
    adsr1: number;
    adsr2: number;
};
/** The seven nonzero reverb approximations implemented by the pinned core,
 * plus Off. Arbitrary register patterns do not create new effects; upstream
 * Echo and Delay entries have no processing configuration and are omitted.
 * Reverb uses private delay buffers in this core, not the sample RAM allocator.
 * @type {ReadonlyArray<Readonly<{id:Ps1ReverbPreset,name:string,registers:ReadonlyArray<number>}>>} */
export declare const PS1_REVERB_PRESETS: ReadonlyArray<Readonly<{
    id: Ps1ReverbPreset;
    name: string;
    registers: ReadonlyArray<number>;
}>>;

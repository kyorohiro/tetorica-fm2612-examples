export declare const EXTRA_YM2413_CLOCK_HELD_ERROR = "Release the manually held additional YM2413 voices before changing the clock";
/** @param {any} synth
 * @returns {Omit<ReturnType<typeof import('./native_genesis_extra_register_voice.js').createNativeExtraRegisterVoice>,'client'> & {client:ReturnType<typeof import('./playground_ym2413.js').createYm2413Client>}}
 */
export declare function createNativeGenesisYm2413Endpoint(synth: any): Omit<ReturnType<typeof import('./native_genesis_extra_register_voice.js').createNativeExtraRegisterVoice>, 'client'> & {
    client: ReturnType<typeof import('./playground_ym2413.js').createYm2413Client>;
};
export declare function createNativeGenesisExtraYm2413(synth: any, options?: {}): Promise<{
    native: boolean;
    ready: boolean;
    nativeInstance: number;
    kind: any;
    label: any;
    client: any;
    endpoint: any;
    clock: any;
    stereoEnabled: any;
    engine?: any;
    layout: {};
    dispose(): void;
    mix(settings: any): void;
}>;

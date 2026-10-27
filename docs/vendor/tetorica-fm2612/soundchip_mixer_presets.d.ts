export declare const SOUNDCHIP_MIXER_LISTENING_LEVELS: {
    segapsg: number;
    ay8910: number;
    nes: number;
    gameboy: number;
    huc6280: number;
};
/** Optional factory policies for new SoundChipMixer().
 * calibrated covers measured standalone-chip routes; other kinds retain their usual defaults.
 * Explicit common and per-ID settings override these fallback values.
 * @type {{readonly calibrated: import('./soundchip_mixer.js').SoundChipMixerOptions}}
 */
export declare const SOUNDCHIP_MIXER_PRESETS: {
    readonly calibrated: import('./soundchip_mixer.js').SoundChipMixerOptions;
};

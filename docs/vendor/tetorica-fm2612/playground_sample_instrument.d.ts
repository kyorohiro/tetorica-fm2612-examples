/**
 * audio is already edited PCM. Device-specific conversion is explicit: PS1 uses
 * native 44.1 kHz mono and 28-frame loop packets; Game Boy uses one 32-point cycle.
 * @param {{pg?: any, audio?: any, chip?: string, target?: 'auto' | 'rf5c164' | 'gameboy-wave' | 'adpcm-b' | 'ps1', volume?: number}} [options]
 */
export declare function createSampleInstrument({ pg, audio, chip, target, volume }?: {
    pg?: any;
    audio?: any;
    chip?: string;
    target?: 'auto' | 'rf5c164' | 'gameboy-wave' | 'adpcm-b' | 'ps1';
    volume?: number;
}): Promise<{
    name: any;
    noteOn(event: any): Promise<void>;
    noteOff(event: any): Promise<void>;
    allNotesOff(): Promise<void>;
}>;

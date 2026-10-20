/**
 * audio is already edited PCM; target adapters never silently crop or resample it.
 * @param {{pg?: any, audio?: any, chip?: string, target?: 'auto' | 'rf5c164' | 'gameboy-wave' | 'adpcm-b', volume?: number}} [options]
 */
export declare function createSampleInstrument({ pg, audio, chip, target, volume }?: {
    pg?: any;
    audio?: any;
    chip?: string;
    target?: 'auto' | 'rf5c164' | 'gameboy-wave' | 'adpcm-b';
    volume?: number;
}): Promise<{
    name: any;
    noteOn(event: any): Promise<void>;
    noteOff(event: any): Promise<void>;
    allNotesOff(): Promise<void>;
}>;

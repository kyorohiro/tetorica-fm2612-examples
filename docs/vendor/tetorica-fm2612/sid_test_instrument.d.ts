export declare const defaultSidSettings: Readonly<{
    waveform: "saw";
    pulseWidth: 2048;
    attack: 2;
    decay: 6;
    sustain: 12;
    release: 5;
    filterMode: "off";
    cutoff: 1200;
    resonance: 4;
    sync: false;
    ring: false;
    modulatorHz: 110;
    master: 0.6;
    clockHz: 985248;
}>;
export declare function validateSidSettings(input: any): any;
export declare class SidTestInstrument {
    core: any;
    settings: any;
    notes: any[];
    held: boolean;
    constructor(core: any, settings?: Readonly<{
        waveform: "saw";
        pulseWidth: 2048;
        attack: 2;
        decay: 6;
        sustain: 12;
        release: 5;
        filterMode: "off";
        cutoff: 1200;
        resonance: 4;
        sync: false;
        ring: false;
        modulatorHz: 110;
        master: 0.6;
        clockHz: 985248;
    }>);
    setSettings(settings: any): void;
    apply(): void;
    playTone(hz?: number): void;
    playChord(): void;
    release(): void;
    stop(): void;
    renderInto(output: any): any;
}

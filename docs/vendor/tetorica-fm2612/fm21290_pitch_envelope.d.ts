export declare class PitchEnvelope {
    chip: any;
    voices: any[];
    group: number;
    rates: any;
    targets: any;
    constructor(chip: any);
    configure({ rates, levels }: {
        levels: any;
        rates: any;
    }): void;
    keyOn(ch: any, base: any): void;
    keyOff(ch: any): void;
    publish(ch: any): void;
    tick(): void;
}

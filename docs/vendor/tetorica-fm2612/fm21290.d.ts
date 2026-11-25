export declare const MODE = 10244, ALGORITHM = 10245, PITCH = 12288, RATIO = 12320, DETUNE = 12336, RATE = 12352, LEVEL = 12384, OUTPUT = 12416, SENS = 12512, AM = 12528, EVENT = 12529, PM = 12530;
export declare function integer(value: any, min: any, max: any, label: any): any;
export declare function validRegister(address: any): void;
export declare class Fm21290 {
    sampleRate: any;
    reg: Uint8Array<ArrayBuffer>;
    algorithms: Uint8Array<ArrayBuffer>;
    voices: {
        active: boolean;
        held: boolean;
        releaseLevel: Float64Array<ArrayBuffer>;
        idleSince: number;
        phase: Float64Array<ArrayBuffer>;
        gain: Float64Array<ArrayBuffer>;
        step: Float64Array<ArrayBuffer>;
        rateOffset: Uint8Array<ArrayBuffer>;
        level: Float64Array<ArrayBuffer>;
        stage: Uint8Array<ArrayBuffer>;
        attackScale: Float64Array<ArrayBuffer>;
        attack: Float64Array<ArrayBuffer>;
        decay: Float64Array<ArrayBuffer>;
        feedback: number;
        previous: number;
    }[];
    attackByRate: Float64Array<ArrayBuffer>;
    decayByRate: Float64Array<ArrayBuffer>;
    targets: Float64Array<ArrayBuffer>;
    bus: Float64Array<ArrayBuffer>;
    amGain: Float64Array<ArrayBuffer>;
    mode: number;
    sync: boolean;
    frame: number;
    constructor(sampleRate?: number);
    updateRate(voice: any, idx: any): void;
    advanceIdle(voice: any): void;
    tune(ch: any): void;
    /** @param {number} address @param {number} data */
    writeRegister(address: number, data: number): void;
    /** @param {Float32Array} buffer */
    renderInto(buffer: Float32Array): void;
}

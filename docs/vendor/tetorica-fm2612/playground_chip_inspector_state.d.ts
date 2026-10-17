export declare class PsgInspectorState {
    clock: () => 3579545;
    sampleRate: number;
    api: {
        [k: string]: any;
    };
    periods: number[] | undefined;
    attenuations: number[] | undefined;
    lastVolumes: number[] | undefined;
    latched: number | undefined;
    mode: number | undefined;
    constructor(chip: any, { clock, sampleRate }?: {
        clock?: (() => 3579545) | undefined;
        sampleRate?: number | undefined;
    });
    reset(): void;
    write(value: any): void;
    read(): {
        kind: string;
        clock: 3579545;
        sampleRate: number;
        channels: {
            channel: any;
            attenuation: number;
            volume: number;
            active: boolean;
            period: number;
            frequency: number | null;
            constantOutput: boolean;
        }[];
        noise: {
            channel: any;
            attenuation: number;
            volume: number;
            active: boolean;
            type: string;
            rate: string;
        };
    };
    invoke(method: any, args?: any[]): any;
}
/** A compact waveform is derived from encoded RAM data, so it also matches mono downmix/clamping. */
/** @param {Uint8Array} bytes @param {{name?:string,frames?:number,step?:number}} [options] */
export declare function rfSampleMetadata(bytes: Uint8Array, { name, frames, step }?: {
    name?: string;
    frames?: number;
    step?: number;
}): {
    name: string;
    frames: number | undefined;
    step: number | undefined;
    waveform: number[];
};
export declare class RfInspectorState {
    clock: () => 12500000;
    sampleRate: number;
    samples: any[];
    memoryRanges: any[];
    memoryRevision: number;
    selected: number | undefined;
    enabled: boolean | undefined;
    mask: any;
    channels: {
        channel: number;
        start: number;
        loopStart: number;
        step: number;
        volume: number;
        pan: {
            left: number;
            right: number;
        };
    }[] | undefined;
    constructor(chip: any, { clock, sampleRate }?: {
        clock?: (() => 12500000) | undefined;
        sampleRate?: number | undefined;
    });
    reset(): void;
    write(register: any, value: any): void;
    memoryWrite(address: any, length: any): void;
    addSample(address: any, bytes: any, metadata: any): {
        name: string;
        frames: number | undefined;
        step: number | undefined;
        waveform: number[];
        address: any;
        end: any;
        loopStart: any;
        valid: boolean;
    };
    allocate(length: any, requested: any): any;
    read(): {
        kind: string;
        clock: 12500000;
        sampleRate: number;
        enabled: boolean | undefined;
        memoryRevision: number;
        channels: {
            channel: number;
            start: number;
            loopStart: number;
            step: number;
            volume: number;
            pan: {
                left: number;
                right: number;
            };
            active: boolean | undefined;
        }[];
        samples: any[];
        memoryRanges: any[];
    };
}
/** Separate admin messages from performance/client RPC: reads never consume or reschedule data. */
export declare function receiveChipInspector(data: any, port: any, handler: any): boolean;
export declare function readPwmInspector(pwm: any): any;
